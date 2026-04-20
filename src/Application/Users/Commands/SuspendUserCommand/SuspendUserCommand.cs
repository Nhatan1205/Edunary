using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Users.Commands.SuspendUserCommand;

public record SuspendUserCommand : IRequest<Result>
{
    public string UserId { get; init; }
    public int DurationDays { get; init; }
    public string Reason { get; init; }
}

public class SuspendUserCommandHandler : IRequestHandler<SuspendUserCommand, Result>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public SuspendUserCommandHandler(
        IIdentityService identityService,
        ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(SuspendUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            return await _identityService.SuspendUserAsync(
                request.UserId, _currentUserService.UserId, request.DurationDays);
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred: {ex.Message}");
        }
    }
}
