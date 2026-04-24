using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Users.Commands.ChangeUserRoleCommand;

[ActivityLog(ActivityType.ChangeUserRole, "Changed a user's role")]
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
