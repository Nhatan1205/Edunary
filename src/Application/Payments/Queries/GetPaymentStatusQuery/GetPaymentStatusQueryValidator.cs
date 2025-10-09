using FluentValidation;

namespace Edunary.Application.Payments.Queries.GetPaymentStatusQuery;

public class GetPaymentStatusQueryValidator : AbstractValidator<GetPaymentStatusQuery>
{
    public GetPaymentStatusQueryValidator()
    {
        RuleFor(q => q.PaymentIntentId)
            .NotEmpty().WithMessage("Payment Intent ID is required.")
            .MinimumLength(3).WithMessage("Payment Intent ID must be at least 3 characters long.")
            .Matches(@"^pi_[a-zA-Z0-9_]+$").WithMessage("Payment Intent ID must be a valid Stripe payment intent format (starts with 'pi_').");
    }
}