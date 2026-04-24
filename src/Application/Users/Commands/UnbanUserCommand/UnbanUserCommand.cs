using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Users.Commands.UnbanUserCommand;

[ActivityLog(ActivityType.UnbanUser, "Unbanned a user account")]
public record UnbanUserCommand : IRequest<Result>
{
    public string UserId { get; init; }
}

public class UnbanUserCommandHandler : IRequestHandler<UnbanUserCommand, Result>
{
    private readonly IIdentityService _identityService;

    public UnbanUserCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<Result> Handle(UnbanUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            return await _identityService.UnbanUserAsync(request.UserId);
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred: {ex.Message}");
        }
    }
}
