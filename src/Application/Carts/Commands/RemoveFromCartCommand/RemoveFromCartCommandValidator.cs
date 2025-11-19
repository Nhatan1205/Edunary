namespace Edunary.Application.Carts.Commands.RemoveFromCartCommand;

public class RemoveFromCartCommandValidator : AbstractValidator<RemoveFromCartCommand>
{
    public RemoveFromCartCommandValidator()
    {
        RuleFor(x => x.CartItemId)
            .GreaterThan(0)
            .WithMessage("Cart item ID must be greater than 0");
    }
}
