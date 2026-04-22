using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Edunary.Application.CourseProgresses.Commands.CreateCourseProgressCommand;
using Edunary.Domain.Entities;

namespace Edunary.Application.Payments.Commands.ConfirmPaymentCommand;

public record ConfirmPaymentCommand : IRequest<ConfirmPaymentDto>
{
    public string PaymentIntentId { get; init; }
}

public class ConfirmPaymentCommandHandler : IRequestHandler<ConfirmPaymentCommand, ConfirmPaymentDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPaymentService _paymentService;
    private readonly ILogger<ConfirmPaymentCommandHandler> _logger;
    private readonly INotifyService _notifyService;
    private readonly ISender _sender;
    private readonly ICurrentUserService _currentUserService;

    public ConfirmPaymentCommandHandler(
        IApplicationDbContext context, 
        IPaymentService paymentService,
        ILogger<ConfirmPaymentCommandHandler> logger,
        INotifyService notifyService,
        ISender sender,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _paymentService = paymentService;
        _logger = logger;
        _notifyService = notifyService;
        _sender = sender;
        _currentUserService = currentUserService;
    }

    public async Task<ConfirmPaymentDto> Handle(ConfirmPaymentCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Confirming payment for PaymentIntentId: {PaymentIntentId}", request.PaymentIntentId);

        var order = await ValidateAndGetOrderAsync(request.PaymentIntentId, cancellationToken);

        if (order.Status == OrderStatus.Completed)
        {
            _logger.LogInformation("Order {OrderId} is already completed", order.Id);
            return new ConfirmPaymentDto
            {
                Success = true,
                Message = "Payment already confirmed",
                OrderId = order.Id.ToString()
            };
        }

        await VerifyPaymentAsync(request.PaymentIntentId, order.TotalAmount, cancellationToken);

        var payment = UpdateOrderAndCreatePayment(order, request.PaymentIntentId);

        var enrollmentsCreated = await CreateEnrollmentsAsync(order, cancellationToken);

        var parsedCourseIds = order.OrderItems
            .Select(oi => oi.CourseId)
            .Where(id => id > 0)
            .ToHashSet();

        await CreditInstructorWalletsAsync(order, payment, parsedCourseIds, cancellationToken);

        await RemoveFromCartAsync(order, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment confirmed successfully for Order: {OrderId}, Enrollments created: {EnrollmentsCount}", 
            order.Id, enrollmentsCreated);

        return new ConfirmPaymentDto
        {
            Success = true,
            Message = "Payment confirmed successfully",
            OrderId = order.Id.ToString()
        };
    }

    private async Task<Domain.Entities.Order> ValidateAndGetOrderAsync(string paymentIntentId, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.PaymentIntentId == paymentIntentId, cancellationToken);

        if (order == null)
        {
            _logger.LogWarning("Order not found for PaymentIntentId: {PaymentIntentId}", paymentIntentId);
            throw new InvalidOperationException("Order not found");
        }

        var currentUserId = _currentUserService.UserId;
        if (order.UserId != currentUserId)
        {
            _logger.LogWarning("Unauthorized payment confirmation attempt. Order {OrderId} belongs to {OrderUserId}, but request from {CurrentUserId}", 
                order.Id, order.UserId, currentUserId);
            throw new UnauthorizedAccessException("You are not authorized to confirm this payment");
        }

        return order;
    }

    private async Task VerifyPaymentAsync(string paymentIntentId, double totalAmount, CancellationToken cancellationToken)
    {
        if (totalAmount > 0)
        {
            var paymentVerified = await _paymentService.VerifyPaymentAsync(paymentIntentId, cancellationToken);

            if (!paymentVerified)
            {
                _logger.LogWarning("Payment verification failed for PaymentIntentId: {PaymentIntentId}", paymentIntentId);
                throw new InvalidOperationException("Payment verification failed");
            }
        }
        else
        {
            _logger.LogInformation(
                "Free order detected. Skipping Stripe verification for PaymentIntentId: {PaymentIntentId}",
                paymentIntentId
            );
        }
    }

    private Domain.Entities.Payment UpdateOrderAndCreatePayment(Domain.Entities.Order order, string paymentIntentId)
    {
        order.Status = OrderStatus.Completed;
        order.CompletedDate = DateTime.UtcNow;

        var payment = new Domain.Entities.Payment
        {
            OrderId = order.Id,
            PaymentIntentId = paymentIntentId,
            Amount = (decimal)order.TotalAmount,
            Status = PaymentStatus.Succeeded,
            PaidDate = DateTime.UtcNow,
            Currency = "USD"
        };

        _context.Payments.Add(payment);
        return payment;
    }

    private async Task<int> CreateEnrollmentsAsync(Domain.Entities.Order order, CancellationToken cancellationToken)
    {
        var enrollmentsCreated = 0;

        foreach (var orderItem in order.OrderItems)
        {
            var courseId = orderItem.CourseId;
            if (courseId <= 0)
            {
                _logger.LogWarning("Invalid CourseId: {CourseId} for Order: {OrderId}", orderItem.CourseId, order.Id);
                continue;
            }

            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == order.UserId, cancellationToken);

            if (existingEnrollment == null)
            {
                var enrollment = new Domain.Entities.Enrollment
                {
                    CourseId = courseId,
                    StudentId = order.UserId
                };

                _context.Enrollments.Add(enrollment);

                var course = await _context.Courses.FindAsync(new object[] { courseId }, cancellationToken: cancellationToken);
                course.UpdateTotalStudents();

                enrollmentsCreated++;
                _logger.LogInformation("Created enrollment for CourseId: {CourseId}, UserId: {UserId}", courseId, order.UserId);
                
                await _sender.Send(new CreateCourseProgressCommand
                {
                    CourseId = courseId,
                    Progress = course.Content
                }, cancellationToken);

                await _notifyService.JoinGroupCourse(courseId);
            }
            else
            {
                _logger.LogWarning("Enrollment already exists for CourseId: {CourseId}, UserId: {UserId}", courseId, order.UserId);
            }
        }

        return enrollmentsCreated;
    }

    private async Task CreditInstructorWalletsAsync(Domain.Entities.Order order, Domain.Entities.Payment payment, 
        HashSet<int> courseIds, CancellationToken cancellationToken)
    {
        if (courseIds.Count == 0 || order.TotalAmount <= 0)
            return;

        var courses = await _context.Courses
            .Where(c => courseIds.Contains(c.Id))
            .Select(c => new { c.Id, c.CreatedBy })
            .ToListAsync(cancellationToken);

        var instructorByCourseId = courses
            .Where(c => !string.IsNullOrWhiteSpace(c.CreatedBy))
            .ToDictionary(c => c.Id, c => c.CreatedBy, EqualityComparer<int>.Default);

        foreach (var orderItem in order.OrderItems)
        {
            var courseId = orderItem.CourseId;
            if (courseId <= 0)
                continue;

            if (!instructorByCourseId.TryGetValue(courseId, out var instructorId) || string.IsNullOrWhiteSpace(instructorId))
                continue;

            var creditAmount = Math.Round((decimal)orderItem.Price, 2);
            if (creditAmount <= 0)
                continue;

            var wallet = await _context.InstructorWallets
                .SingleOrDefaultAsync(w => w.InstructorId == instructorId, cancellationToken);

            if (wallet == null)
            {
                wallet = new InstructorWallet
                {
                    InstructorId = instructorId,
                    Balance = 0m
                };
                _context.InstructorWallets.Add(wallet);
            }

            wallet.Balance += creditAmount;

            _context.InstructorWalletTransactions.Add(new InstructorWalletTransaction
            {
                InstructorWallet = wallet,
                OrderId = order.Id,
                CourseId = courseId,
                Amount = creditAmount,
                Currency = payment.Currency
            });
        }
    }

    private async Task RemoveFromCartAsync(Domain.Entities.Order order, CancellationToken cancellationToken)
    {
        var courseIds = order.OrderItems.Select(oi => oi.CourseId).ToList();
        var cartItemsToRemove = await _context.Carts
            .Where(c => c.CustomerId == order.UserId && courseIds.Contains(c.CourseId))
            .ToListAsync(cancellationToken);

        if (cartItemsToRemove.Any())
        {
            _context.Carts.RemoveRange(cartItemsToRemove);
            _logger.LogInformation("Removed {Count} items from cart for UserId: {UserId}", cartItemsToRemove.Count, order.UserId);
        }
    }
}
