using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Payments.Queries.GetPaymentStatusQuery;

public record GetPaymentStatusQuery : IRequest<Result>
{
    public string PaymentIntentId { get; init; }
}

public class GetPaymentStatusQueryHandler : IRequestHandler<GetPaymentStatusQuery, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IPaymentService _paymentService;
    private readonly ILogger<GetPaymentStatusQueryHandler> _logger;
    private readonly ICurrentUserService _currentUserService;

    public GetPaymentStatusQueryHandler(
        IApplicationDbContext context, 
        IPaymentService paymentService,
        ILogger<GetPaymentStatusQueryHandler> logger,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _paymentService = paymentService;
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(GetPaymentStatusQuery request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Getting payment status for PaymentIntentId: {PaymentIntentId}", request.PaymentIntentId);

            // Get order from database
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.PaymentIntentId == request.PaymentIntentId, cancellationToken);

            if (order == null)
            {
                _logger.LogWarning("Order not found for PaymentIntentId: {PaymentIntentId}", request.PaymentIntentId);
                return Result.Failure("Order not found for the provided payment intent ID");
            }

            // Verify current user owns this order
            var currentUserId = _currentUserService.UserId;
            if (order.UserId != currentUserId)
            {
                _logger.LogWarning("Unauthorized payment status query. Order {OrderId} belongs to {OrderUserId}, but request from {CurrentUserId}", 
                    order.Id, order.UserId, currentUserId);
                return Result.Failure("You are not authorized to view this payment status");
            }

            string stripePaymentStatus;

            // Stripe does not have a PaymentIntent for free ($0) orders.
            // Therefore, derive status from our order state.
            if (order.TotalAmount <= 0)
            {
                stripePaymentStatus = order.Status == OrderStatus.Completed ? "succeeded" : "pending";
            }
            else
            {
                // Get payment status from Stripe
                stripePaymentStatus = await _paymentService.GetPaymentStatusAsync(request.PaymentIntentId, cancellationToken);

                if (string.IsNullOrEmpty(stripePaymentStatus))
                {
                    _logger.LogWarning("Unable to get payment status from Stripe for PaymentIntentId: {PaymentIntentId}", request.PaymentIntentId);
                    stripePaymentStatus = "Unknown";
                }
            }

            var payment = order.Payments?.FirstOrDefault();

            var response = new PaymentStatusDto
            {
                PaymentStatus = stripePaymentStatus,
                OrderStatus = order.Status.ToString(),
                Amount = (decimal)order.TotalAmount,
                OrderId = order.Id.ToString(),
                PaymentDate = payment?.PaidDate,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    CourseId = oi.CourseId,
                    CourseName = oi.CourseName,
                    Price = (decimal)oi.Price
                }).ToList()
            };

            _logger.LogInformation("Successfully retrieved payment status for Order: {OrderId}", order.Id);
            return Result.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting payment status for PaymentIntentId: {PaymentIntentId}", request.PaymentIntentId);
            return Result.Failure($"An error occurred while retrieving payment status: {ex.Message}");
        }
    }
}
