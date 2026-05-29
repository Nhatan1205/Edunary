using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Finance.Models;
using Edunary.Domain.Enums;
using Edunary.Application.CourseProgresses.Commands.CreateCourseProgressCommand;
using Edunary.Domain.Entities;
using Edunary.Domain.Constants;

namespace Edunary.Application.Payments.Commands.ConfirmPaymentCommand;

[ActivityLog(ActivityType.CompletePurchase, "Completed a purchase")]
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
    private readonly ICouponService _couponService;
    private readonly ILedgerService _ledgerService;
    private readonly IRevenueSplitService _revenueSplitService;

    public ConfirmPaymentCommandHandler(
        IApplicationDbContext context,
        IPaymentService paymentService,
        ILogger<ConfirmPaymentCommandHandler> logger,
        INotifyService notifyService,
        ISender sender,
        ICurrentUserService currentUserService,
        ICouponService couponService,
        ILedgerService ledgerService,
        IRevenueSplitService revenueSplitService)
    {
        _context = context;
        _paymentService = paymentService;
        _logger = logger;
        _notifyService = notifyService;
        _sender = sender;
        _currentUserService = currentUserService;
        _couponService = couponService;
        _ledgerService = ledgerService;
        _revenueSplitService = revenueSplitService;
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

        await _couponService.ConsumeAsync(order.Id, cancellationToken);

        await PostOrderToLedgerAsync(order, parsedCourseIds, cancellationToken);

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
        if (courseIds.Count == 0)
            return;

        var courses = await _context.Courses
            .Where(c => courseIds.Contains(c.Id))
            .Select(c => new { c.Id, c.CreatedBy })
            .ToListAsync(cancellationToken);

        var instructorByCourseId = courses
            .Where(c => !string.IsNullOrWhiteSpace(c.CreatedBy))
            .ToDictionary(c => c.Id, c => c.CreatedBy, EqualityComparer<int>.Default);

        // Collaborators được chia tiền, gom theo course
        var collabsByCourseId = await LoadAcceptedCollaboratorsAsync(courseIds, cancellationToken);

        // Cache ví theo userId: tránh query lại ví vừa Add nhưng chưa SaveChanges (cùng user ở nhiều order item)
        var walletCache = new Dictionary<string, InstructorWallet>();

        var occurredAt = order.CompletedDate.HasValue
            ? new DateTimeOffset(order.CompletedDate.Value, TimeSpan.Zero)
            : DateTimeOffset.UtcNow;

        foreach (var orderItem in order.OrderItems)
        {
            var courseId = orderItem.CourseId;
            if (courseId <= 0)
                continue;

            if (!instructorByCourseId.TryGetValue(courseId, out var instructorId) || string.IsNullOrWhiteSpace(instructorId))
                continue;

            var baseAmount = Math.Round((decimal)orderItem.Price, 2);

            if (baseAmount <= 0)
                continue;

            var split = await _revenueSplitService.SplitAsync(baseAmount, orderItem.SalesChannel, occurredAt, cancellationToken);
            var instructorCredit = split.InstructorShare;

            if (instructorCredit <= 0)
                continue;

            // Chia phần instructor thành owner + collaborators của khóa này
            var alloc = AllocateInstructorShare(instructorCredit, instructorId,
                collabsByCourseId.GetValueOrDefault(courseId, new List<CourseCollaborator>()));

            // Credit owner trước rồi tới từng collaborator, find-or-create ví qua cache
            foreach (var (userId, amount) in EnumerateRecipients(alloc))
            {
                if (amount <= 0)
                    continue;

                var wallet = await GetOrCreateWalletAsync(walletCache, userId, cancellationToken);
                wallet.Balance += amount;

                _context.InstructorWalletTransactions.Add(new InstructorWalletTransaction
                {
                    InstructorWallet = wallet,
                    OrderId = order.Id,
                    CourseId = courseId,
                    Amount = amount,
                    Currency = payment.Currency
                });
            }
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

    private async Task PostOrderToLedgerAsync(Domain.Entities.Order order, HashSet<int> courseIds, CancellationToken cancellationToken)
    {
        if (courseIds.Count == 0)
            return;

        var courses = await _context.Courses
            .Where(c => courseIds.Contains(c.Id))
            .Select(c => new { c.Id, c.CreatedBy })
            .ToListAsync(cancellationToken);

        var instructorByCourseId = courses
            .Where(c => !string.IsNullOrWhiteSpace(c.CreatedBy))
            .ToDictionary(c => c.Id, c => c.CreatedBy, EqualityComparer<int>.Default);

        // Collaborators được chia tiền, gom theo course
        var collabsByCourseId = await LoadAcceptedCollaboratorsAsync(courseIds, cancellationToken);

        var occurredAt = order.CompletedDate.HasValue
            ? new DateTimeOffset(order.CompletedDate.Value, TimeSpan.Zero)
            : DateTimeOffset.UtcNow;

        foreach (var orderItem in order.OrderItems)
        {
            var courseId = orderItem.CourseId;
            if (courseId <= 0)
                continue;

            if (!instructorByCourseId.TryGetValue(courseId, out var instructorId) || string.IsNullOrWhiteSpace(instructorId))
                continue;

            var baseAmount = Math.Round((decimal)orderItem.Price, 2);

            if (baseAmount <= 0)
                continue;

            var split = await _revenueSplitService.SplitAsync(baseAmount, orderItem.SalesChannel, occurredAt, cancellationToken);
            var instructorShare = split.InstructorShare;
            var platformShare = split.PlatformShare;

            // Chia phần instructor thành owner + collaborators của khóa này
            var alloc = AllocateInstructorShare(instructorShare, instructorId,
                collabsByCourseId.GetValueOrDefault(courseId, new List<CourseCollaborator>()));

            var vatAmount = Math.Round((decimal)orderItem.VatAmount, 4);
            var desc = $"Order {order.Id} / Course {courseId}";

            // Transaction 1: payment received — Dr CASH_STRIPE, Cr VAT_LIABILITY + INSTRUCTOR_GROSS (mỗi người) + PLATFORM_REVENUE
            var paymentEntries = new List<LedgerEntryInput>
            {
                new LedgerEntryInput
                {
                    AccountCode = LedgerAccountCode.CashStripe,
                    Side = EntrySide.Debit,
                    Amount = baseAmount + vatAmount,
                    Description = desc
                }
            };
            if (vatAmount > 0)
                paymentEntries.Add(new LedgerEntryInput
                {
                    AccountCode = LedgerAccountCode.VatLiability,
                    Side = EntrySide.Credit,
                    Amount = vatAmount,
                    Description = desc
                });
            // Credit gross earnings cho owner + từng collaborator theo phần được chia
            foreach (var (userId, amount) in EnumerateRecipients(alloc))
            {
                if (amount <= 0)
                    continue;
                paymentEntries.Add(new LedgerEntryInput
                {
                    AccountCode = LedgerAccountCode.InstructorGrossEarnings,
                    Side = EntrySide.Credit,
                    Amount = amount,
                    UserId = userId,
                    Description = desc
                });
            }
            if (platformShare > 0)
                paymentEntries.Add(new LedgerEntryInput
                {
                    AccountCode = LedgerAccountCode.PlatformRevenue,
                    Side = EntrySide.Credit,
                    Amount = platformShare,
                    Description = desc
                });

            await _ledgerService.PostAsync(new LedgerPosting
            {
                TransactionType = LedgerTransactionType.OrderPaid,
                ReferenceType = "Order",
                ReferenceId = order.Id.ToString(),
                Currency = "USD",
                OccurredAt = occurredAt,
                Entries = paymentEntries
            }, cancellationToken);

            if (instructorShare <= 0)
                continue;

            // Transaction 2: chuyển gross → net cho từng người nhận (withholding xử lý lúc rút tiền)
            var allocationEntries = new List<LedgerEntryInput>();
            foreach (var (userId, amount) in EnumerateRecipients(alloc))
            {
                if (amount <= 0)
                    continue;
                allocationEntries.Add(new LedgerEntryInput
                {
                    AccountCode = LedgerAccountCode.InstructorGrossEarnings,
                    Side = EntrySide.Debit,
                    Amount = amount,
                    UserId = userId,
                    Description = $"Net allocation: {desc}"
                });
                allocationEntries.Add(new LedgerEntryInput
                {
                    AccountCode = LedgerAccountCode.InstructorNetBalance,
                    Side = EntrySide.Credit,
                    Amount = amount,
                    UserId = userId,
                    Description = $"Net allocation: {desc}"
                });
            }

            await _ledgerService.PostAsync(new LedgerPosting
            {
                TransactionType = LedgerTransactionType.Adjustment,
                ReferenceType = "Order",
                ReferenceId = order.Id.ToString(),
                Currency = "USD",
                OccurredAt = occurredAt,
                Entries = allocationEntries
            }, cancellationToken);
        }
    }

    private record CollaboratorShare(string UserId, decimal Amount);
    private record InstructorAllocation(string OwnerId, decimal OwnerAmount, IReadOnlyList<CollaboratorShare> Collaborators);

    // Chỉ collaborator đã chấp nhận lời mời và có % > 0 mới được chia tiền; gom theo course để tra nhanh
    private async Task<Dictionary<int, List<CourseCollaborator>>> LoadAcceptedCollaboratorsAsync(
        HashSet<int> courseIds, CancellationToken ct)
    {
        var collabs = await _context.CourseCollaborators
            .Where(c => courseIds.Contains(c.CourseId)
                     && c.InviteStatus == CollaboratorInviteStatus.Accepted
                     && c.RevenueSharePercent > 0)
            .ToListAsync(ct);
        return collabs.GroupBy(c => c.CourseId).ToDictionary(g => g.Key, g => g.ToList());
    }

    // Pure: chia instructorShare cho owner + collaborators; owner nhận phần dư nên không mất xu nào
    private static InstructorAllocation AllocateInstructorShare(
        decimal instructorShare, string ownerId, IReadOnlyList<CourseCollaborator> collabs)
    {
        // Phần mỗi collaborator = % của họ trên phần instructor; bỏ qua khoản làm tròn về 0
        var shares = new List<CollaboratorShare>();
        var total = 0m;
        foreach (var c in collabs)
        {
            var amt = Math.Round(instructorShare * (c.RevenueSharePercent / 100m), 4, MidpointRounding.ToEven);
            if (amt <= 0)
                continue;
            shares.Add(new CollaboratorShare(c.UserId, amt));
            total += amt;
        }
        // Owner nhận phần còn lại; kẹp về 0 phòng khi tổng % chạm 100
        var ownerAmount = Math.Max(0m, instructorShare - total);
        return new InstructorAllocation(ownerId, ownerAmount, shares);
    }

    // Liệt kê người nhận theo thứ tự: owner trước, rồi tới các collaborator
    private static IEnumerable<(string UserId, decimal Amount)> EnumerateRecipients(InstructorAllocation alloc)
    {
        yield return (alloc.OwnerId, alloc.OwnerAmount);
        foreach (var c in alloc.Collaborators)
            yield return (c.UserId, c.Amount);
    }

    // Find-or-create ví: ưu tiên cache, rồi DB, cuối cùng tạo mới
    private async Task<InstructorWallet> GetOrCreateWalletAsync(
        Dictionary<string, InstructorWallet> cache, string userId, CancellationToken ct)
    {
        if (cache.TryGetValue(userId, out var cached))
            return cached;

        var wallet = await _context.InstructorWallets
            .SingleOrDefaultAsync(w => w.InstructorId == userId, ct);

        if (wallet == null)
        {
            wallet = new InstructorWallet { InstructorId = userId, Balance = 0m };
            _context.InstructorWallets.Add(wallet);
        }

        cache[userId] = wallet;
        return wallet;
    }
}
