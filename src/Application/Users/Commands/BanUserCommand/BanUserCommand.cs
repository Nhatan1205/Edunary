using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Users.Commands.BanUserCommand;

public record BanUserCommand : IRequest<Result>
{
    public string UserId { get; init; }
    public string Reason { get; init; }
}

public class BanUserCommandHandler : IRequestHandler<BanUserCommand, Result>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public BanUserCommandHandler(
        IIdentityService identityService,
        ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(BanUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            return await _identityService.BanUserAsync(request.UserId, _currentUserService.UserId);
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred: {ex.Message}");
        }
    }
}
