using Stripe;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Payments.Commands.CreatePaymentIntentCommand;
using Edunary.Application.SystemSettings.Queries.GetSystemSettingValuesQuery;
using Edunary.Domain.Common;
using Edunary.Domain.Constants;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MediatR;

namespace Edunary.Infrastructure.Services;

public class StripePaymentService : IPaymentService
{
    private readonly PaymentIntentService _paymentIntentService; // Stripe service
    private readonly IConfiguration _configuration;
    private readonly AppSettings _appSettings;
    private readonly IMediator _mediator;

    public StripePaymentService(IConfiguration configuration, IOptions<AppSettings> appSettings, IMediator mediator)
    {
        _configuration = configuration;
        _appSettings = appSettings.Value;
        _mediator = mediator;
        _paymentIntentService = new PaymentIntentService();
    }

    // Set Stripe API key, Db then fallback to appsettings
    private async Task SetStripeApiKeyAsync()
    {
        var dbValues = await _mediator.Send(new GetSystemSettingValuesQuery
        {
            Keys = new() { SettingKey.Stripe_SecretKey }
        });

        var dbKey = dbValues.GetValueOrDefault(SettingKey.Stripe_SecretKey, string.Empty);
        StripeConfiguration.ApiKey = !string.IsNullOrEmpty(dbKey) ? dbKey : _appSettings.StripeSecretKey;
    }

    public async Task<CreatePaymentIntentDto> CreatePaymentIntentAsync(
        List<CoursePaymentInfo> courses,
        string userEmail,
        decimal vatAmount = 0m,
        CancellationToken cancellationToken = default)
    {
        await SetStripeApiKeyAsync();

        var totalAmount = courses.Sum(c => c.Price);
        var chargeAmount = totalAmount + vatAmount;
        var amountInCents = (long)decimal.Round(chargeAmount * 100m, 0, MidpointRounding.AwayFromZero);

        var metadata = new Dictionary<string, string>
        {
            { "course_ids", string.Join(",", courses.Select(c => c.Id)) },
            { "course_names", string.Join(",", courses.Select(c => c.Name)) },
            { "user_email", userEmail }
        };

        if (vatAmount > 0)
            metadata["vat_amount"] = vatAmount.ToString("F4");

        var options = new PaymentIntentCreateOptions
        {
            Amount = amountInCents,
            Currency = "usd",
            ReceiptEmail = userEmail,
            Metadata = metadata
        };

        var paymentIntent = await _paymentIntentService.CreateAsync(options, cancellationToken: cancellationToken);

        return new CreatePaymentIntentDto
        {
            ClientSecret = paymentIntent.ClientSecret,
            Amount = chargeAmount,
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

    public async Task<(bool IsReachable, string Error)> CheckConnectionAsync(CancellationToken ct = default)
    {
        try
        {
            await SetStripeApiKeyAsync();
            var balanceService = new BalanceService();
            await balanceService.GetAsync(cancellationToken: ct);
            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }
}

