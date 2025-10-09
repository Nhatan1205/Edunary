namespace Edunary.Application.Payments.Queries.GetPaymentStatusQuery;

public class PaymentStatusDto
{
    public string PaymentStatus { get; set; }
    public string OrderStatus { get; set; }
    public decimal Amount { get; set; }
    public string OrderId { get; set; }
    public DateTime? PaymentDate { get; set; }
    public List<OrderItemDto> OrderItems { get; set; } = new();
}

public class OrderItemDto
{
    public string CourseId { get; set; }
    public string CourseName { get; set; }
    public decimal Price { get; set; }
}