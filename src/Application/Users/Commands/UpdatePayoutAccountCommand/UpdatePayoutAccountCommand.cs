#nullable enable
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Users.Commands.UpdatePayoutAccountCommand;

public class UpdatePayoutAccountCommand : IRequest<Result>
{
    public string? Bank { get; init; }
    public string? BankNumber { get; init; }
    public string? BankAccountHolder { get; init; }
}

public class UpdatePayoutAccountCommandHandler : IRequestHandler<UpdatePayoutAccountCommand, Result>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public UpdatePayoutAccountCommandHandler(IIdentityService identityService, ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdatePayoutAccountCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Result.Failure("User not authenticated");
        }

        return await _identityService.UpdatePayoutAccountAsync(
            userId,
            request.Bank,
            request.BankNumber,
            request.BankAccountHolder);
    }
}
