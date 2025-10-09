namespace Edunary.Application.Payments.Commands.CreatePaymentIntentCommand;

public class CreatePaymentIntentDto
{
    public string ClientSecret { get; set; }
    public decimal Amount { get; set; }
    public string PaymentIntentId { get; set; }
}