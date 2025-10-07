using Stripe;
using Edunary.Application.Common.Interfaces;
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

    public async Task<CreatePaymentIntentResponse> CreatePaymentIntentAsync(
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

        return new CreatePaymentIntentResponse
        {
            ClientSecret = paymentIntent.ClientSecret,
            Amount = totalAmount,
            PaymentIntentId = paymentIntent.Id
        };
    }
}