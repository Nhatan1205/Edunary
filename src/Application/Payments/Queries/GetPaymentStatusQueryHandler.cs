using MediatR;
using Microsoft.EntityFrameworkCore;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Payments.Queries;

public class GetPaymentStatusQueryHandler : IRequestHandler<GetPaymentStatusQuery, PaymentStatusResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IPaymentService _paymentService;

    public GetPaymentStatusQueryHandler(IApplicationDbContext context, IPaymentService paymentService)
    {
        _context = context;
        _paymentService = paymentService;
    }

    public async Task<PaymentStatusResponse> Handle(GetPaymentStatusQuery request, CancellationToken cancellationToken)
    {
        // Get order from database
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.PaymentIntentId == request.PaymentIntentId, cancellationToken);

        if (order == null)
        {
            throw new Exception("Order not found");
        }

        // Get payment status from Stripe
        var stripePaymentStatus = await _paymentService.GetPaymentStatusAsync(request.PaymentIntentId, cancellationToken);

        var payment = order.Payments?.FirstOrDefault();

        return new PaymentStatusResponse
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
    }
}