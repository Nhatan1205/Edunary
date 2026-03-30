using FluentValidation;

namespace Edunary.Application.Payments.Commands.ConfirmPaymentCommand;

public class ConfirmPaymentCommandValidator : AbstractValidator<ConfirmPaymentCommand>
{
    public ConfirmPaymentCommandValidator()
    {
        RuleFor(c => c.PaymentIntentId)
            .NotEmpty().WithMessage("Payment Intent ID is required.")
            .MinimumLength(3).WithMessage("Payment Intent ID must be at least 3 characters long.")
            .Matches(@"^(pi_|free_)[a-zA-Z0-9_]+$")
            .WithMessage("Payment Intent ID must be a valid Stripe payment intent format (starts with 'pi_') or an internal free checkout format (starts with 'free_').");
    }
}