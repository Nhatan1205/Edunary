using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Users.Commands.RestrictUserCommand;

[ActivityLog(ActivityType.RestrictUser, "Restricted a user account")]
public record RestrictUserCommand : IRequest<Result>
{
    public string UserId { get; init; }

    public int? DurationDays { get; init; }

    public string Reason { get; init; }
}

public class RestrictUserCommandHandler : IRequestHandler<RestrictUserCommand, Result>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public RestrictUserCommandHandler(
        IIdentityService identityService,
        ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(RestrictUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            return await _identityService.RestrictUserAsync(
                request.UserId,
                _currentUserService.UserId,
                request.DurationDays);
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred: {ex.Message}");
        }
    }
}
