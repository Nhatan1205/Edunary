using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

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

    public ConfirmPaymentCommandHandler(
        IApplicationDbContext context, 
        IPaymentService paymentService,
        ILogger<ConfirmPaymentCommandHandler> logger,
        INotifyService notifyService)
    {
        _context = context;
        _paymentService = paymentService;
        _logger = logger;
        _notifyService = notifyService;
    }

    public async Task<ConfirmPaymentDto> Handle(ConfirmPaymentCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Confirming payment for PaymentIntentId: {PaymentIntentId}", request.PaymentIntentId);

        // Find the order by PaymentIntentId
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.PaymentIntentId == request.PaymentIntentId, cancellationToken);

        if (order == null)
        {
            _logger.LogWarning("Order not found for PaymentIntentId: {PaymentIntentId}", request.PaymentIntentId);
            throw new InvalidOperationException("Order not found");
        }

        // Check if order is already completed
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

        // Verify payment with Stripe
        var paymentVerified = await _paymentService.VerifyPaymentAsync(request.PaymentIntentId, cancellationToken);
        
        if (!paymentVerified)
        {
            _logger.LogWarning("Payment verification failed for PaymentIntentId: {PaymentIntentId}", request.PaymentIntentId);
            throw new InvalidOperationException("Payment verification failed");
        }

        // Update order status
        order.Status = OrderStatus.Completed;
        order.CompletedDate = DateTime.UtcNow;

        // Create payment record
        var payment = new Domain.Entities.Payment
        {
            OrderId = order.Id,
            PaymentIntentId = request.PaymentIntentId,
            Amount = (decimal)order.TotalAmount,
            Status = PaymentStatus.Succeeded,
            PaidDate = DateTime.UtcNow,
            Currency = "USD" // This could come from Stripe
        };

        _context.Payments.Add(payment);

        // Create enrollments for each course in the order
        var enrollmentsCreated = 0;
        foreach (var orderItem in order.OrderItems)
        {
            // Parse CourseId from string to int
            if (int.TryParse(orderItem.CourseId, out int courseId))
            {
                // Check if enrollment already exists to avoid duplicates
                var existingEnrollment = await _context.Enrollments
                    .FirstOrDefaultAsync(e => e.CourseId == courseId && 
                                            e.StudentId == order.UserId, 
                                        cancellationToken);

                if (existingEnrollment == null)
                {
                    var enrollment = new Domain.Entities.Enrollment
                    {
                        CourseId = courseId,
                        StudentId = order.UserId
                    };

                    _context.Enrollments.Add(enrollment);
                    enrollmentsCreated++;
                    _logger.LogInformation("Created enrollment for CourseId: {CourseId}, UserId: {UserId}", courseId, order.UserId);

                    // Add connection to notification course group
                    await _notifyService.JoinGroupCourse(courseId);
                }
                else
                {
                    _logger.LogWarning("Enrollment already exists for CourseId: {CourseId}, UserId: {UserId}", courseId, order.UserId);
                }
            }
            else
            {
                _logger.LogWarning("Failed to parse CourseId: {CourseId} for Order: {OrderId}", orderItem.CourseId, order.Id);
            }
        }

        var result = await _context.SaveChangesAsync(cancellationToken);
        
        if (result <= 0)
        {
            _logger.LogError("Failed to save payment confirmation changes for Order: {OrderId}", order.Id);
            throw new InvalidOperationException("Failed to save payment confirmation");
        }

        _logger.LogInformation("Payment confirmed successfully for Order: {OrderId}, Enrollments created: {EnrollmentsCount}", 
            order.Id, enrollmentsCreated);

        return new ConfirmPaymentDto
        {
            Success = true,
            Message = "Payment confirmed successfully",
            OrderId = order.Id.ToString()
        };
    }
}
