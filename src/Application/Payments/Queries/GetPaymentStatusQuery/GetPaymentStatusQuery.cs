using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

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

    public GetPaymentStatusQueryHandler(
        IApplicationDbContext context, 
        IPaymentService paymentService,
        ILogger<GetPaymentStatusQueryHandler> logger)
    {
        _context = context;
        _paymentService = paymentService;
        _logger = logger;
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

            // Get payment status from Stripe
            var stripePaymentStatus = await _paymentService.GetPaymentStatusAsync(request.PaymentIntentId, cancellationToken);
            
            if (string.IsNullOrEmpty(stripePaymentStatus))
            {
                _logger.LogWarning("Unable to get payment status from Stripe for PaymentIntentId: {PaymentIntentId}", request.PaymentIntentId);
                stripePaymentStatus = "Unknown";
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
