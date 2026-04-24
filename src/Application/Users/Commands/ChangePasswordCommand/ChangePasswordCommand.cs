using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Users.Commands.ChangePasswordCommand;

[ActivityLog(ActivityType.ChangePassword, "Change Password")]
public class ChangePasswordCommand : IRequest<Result>
{
    public string OldPassword { get; init; }
    public string NewPassword { get; init; }
}

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public ChangePasswordCommandHandler(
        IIdentityService identityService,
        ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userId))
            {
                return Result.Failure("User not authenticated.");
            }

            // Check old password
            var isValidPassword = await _identityService.CheckPassword(userId, request.OldPassword);
            if (!isValidPassword)
            {
                return Result.Failure("Old password is incorrect.");
            }

            // Change password
            var result = await _identityService.ChangePassword(userId, request.NewPassword);
            
            return result;
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred while changing password: {ex.Message}");
        }
    }
}
