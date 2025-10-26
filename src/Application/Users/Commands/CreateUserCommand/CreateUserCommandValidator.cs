using FluentValidation;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Users.Commands.CreateUserCommand;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    private readonly IIdentityService _identityService;

    public CreateUserCommandValidator(IIdentityService identityService)
    {
        _identityService = identityService;

        RuleFor(x => x.UserName)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Maximum length is 200 characters.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone Number is required.")
            .MaximumLength(15).WithMessage("Maximum length is 15 characters.")
            .Matches("^[0-9]+$").WithMessage("Phone Number must contain only numbers.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email is invalid.")
            .Matches(@"^[a-zA-Z0-9]+(?:[-._]?[a-zA-Z0-9]+)+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
            .WithMessage("Email is invalid.")
            .MustAsync(async (email, cancellation) => 
            {
                var exists = await _identityService.CheckUserNameExist(email);
                return !exists;
            })
            .WithMessage("Email already exists.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
            .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])")
            .WithMessage("Password must include uppercase, lowercase, number, and special character.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Customer Name is required.")
            .MaximumLength(200).WithMessage("Maximum length is 200 characters.");
    }
}
