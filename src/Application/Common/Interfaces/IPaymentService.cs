#nullable enable
using Edunary.Application.Payments.Commands.CreatePaymentIntentCommand;

namespace Edunary.Application.Common.Interfaces;

public interface IPaymentService
{
    Task<CreatePaymentIntentDto> CreatePaymentIntentAsync(List<CoursePaymentInfo> courses, string userEmail, decimal vatAmount = 0m, CancellationToken cancellationToken = default);
    Task<bool> VerifyPaymentAsync(string paymentIntentId, CancellationToken cancellationToken = default);
    Task<string> GetPaymentStatusAsync(string paymentIntentId, CancellationToken cancellationToken = default);

    // Health probe
    Task<(bool IsReachable, string? Error)> CheckConnectionAsync(CancellationToken ct = default);
}

public class CoursePaymentInfo
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool AllowPlatformCoupons { get; set; } = true;
}