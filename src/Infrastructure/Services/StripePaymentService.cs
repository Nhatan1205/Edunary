using Stripe;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Payments.Commands.CreatePaymentIntentCommand;
using Microsoft.Extensions.Configuration;

namespace Edunary.Infrastructure.Services;

public class StripePaymentService : IPaymentService
{
    private readonly PaymentIntentService _paymentIntentService; // Stripe service
    private readonly IConfiguration _configuration;

    public StripePaymentService(IConfiguration configuration)
    {
        _configuration = configuration;
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
        _paymentIntentService = new PaymentIntentService();
    }

    public async Task<CreatePaymentIntentDto> CreatePaymentIntentAsync(
        List<CoursePaymentInfo> courses, 
        string userEmail, 
        CancellationToken cancellationToken = default)
    {
        var totalAmount = courses.Sum(c => c.Price);
        var amountInCents = (long)(totalAmount * 100); // Stripe requires amount in cents

        var options = new PaymentIntentCreateOptions
        {
            Amount = amountInCents,
            Currency = "usd",
            ReceiptEmail = userEmail,
            Metadata = new Dictionary<string, string>
            {
                {"course_ids", string.Join(",", courses.Select(c => c.Id))},
                {"course_names", string.Join(",", courses.Select(c => c.Name))},
                {"user_email", userEmail}
            }
        };

        var paymentIntent = await _paymentIntentService.CreateAsync(options, cancellationToken: cancellationToken);

        return new CreatePaymentIntentDto
        {
            ClientSecret = paymentIntent.ClientSecret,
            Amount = totalAmount,
            PaymentIntentId = paymentIntent.Id
        };
    }

    public async Task<bool> VerifyPaymentAsync(string paymentIntentId, CancellationToken cancellationToken = default)
    {
        try
        {
            var paymentIntent = await _paymentIntentService.GetAsync(paymentIntentId, cancellationToken: cancellationToken);
            return paymentIntent.Status == "succeeded";
        }
        catch
        {
            return false;
        }
    }

    public async Task<string> GetPaymentStatusAsync(string paymentIntentId, CancellationToken cancellationToken = default)
    {
        try
        {
            var paymentIntent = await _paymentIntentService.GetAsync(paymentIntentId, cancellationToken: cancellationToken);
            return paymentIntent.Status;
        }
        catch
        {
            return "unknown";
        }
    }
}
