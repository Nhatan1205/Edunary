using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Users.Commands.ChangeUserRoleCommand;

public record ChangeUserRoleCommand : IRequest<Result>
{
    public string UserId { get; init; }
    public string NewRole { get; init; }
}

public class ChangeUserRoleCommandHandler : IRequestHandler<ChangeUserRoleCommand, Result>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public ChangeUserRoleCommandHandler(
        IIdentityService identityService,
        ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(ChangeUserRoleCommand request, CancellationToken cancellationToken)
    {
        try
        {
            return await _identityService.ChangeUserRoleAsync(
                request.UserId, request.NewRole, _currentUserService.UserId);
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred: {ex.Message}");
        }
    }
}
