namespace Edunary.Application.Common.Interfaces;

public interface IPaymentService
{
    Task<CreatePaymentIntentResponse> CreatePaymentIntentAsync(List<CoursePaymentInfo> courses, string userEmail, CancellationToken cancellationToken = default);
    Task<bool> VerifyPaymentAsync(string paymentIntentId, CancellationToken cancellationToken = default);
    Task<string> GetPaymentStatusAsync(string paymentIntentId, CancellationToken cancellationToken = default);
}

public class CoursePaymentInfo
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
}

public class CreatePaymentIntentResponse
{
    public string ClientSecret { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentIntentId { get; set; } = string.Empty;
}