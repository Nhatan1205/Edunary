using MediatR;

namespace Edunary.Application.Payments.Queries;

public class GetPaymentStatusQuery : IRequest<PaymentStatusResponse>
{
    public string PaymentIntentId { get; set; } = string.Empty;
}

public class PaymentStatusResponse
{
    public string PaymentStatus { get; set; } = string.Empty; // From Stripe
    public string OrderStatus { get; set; } = string.Empty;   // From local DB
    public decimal Amount { get; set; }
    public string OrderId { get; set; } = string.Empty;
    public DateTime? PaymentDate { get; set; }
    public List<OrderItemDto> OrderItems { get; set; } = new();
}

public class OrderItemDto
{
    public string CourseId { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public decimal Price { get; set; }
}