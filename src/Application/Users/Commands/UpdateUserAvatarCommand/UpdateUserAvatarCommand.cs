using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Common;
using Edunary.Domain.Enums;

namespace Edunary.Application.Users.Commands.UpdateUserAvatarCommand;

[ActivityLog(ActivityType.UpdateUserAvatar, "Update User avatar")]
public class UpdateUserAvatarCommand : IRequest<Result>
{
    public string ImageUrl { get; init; }
}

public class UpdateUserAvatarCommandHandler : IRequestHandler<UpdateUserAvatarCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IUploadFileService _uploadFileService;
    private readonly IIdentityService _identityService;

    public UpdateUserAvatarCommandHandler(ICurrentUserService currentUserService, IUploadFileService uploadFileService, IIdentityService identityService)
    {
        _currentUserService = currentUserService;
        _uploadFileService = uploadFileService;
        _identityService = identityService;
    }

    public async Task<Result> Handle(UpdateUserAvatarCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Result.Failure("User not authenticated");
        }
        var avatarUrl = await _uploadFileService.UploadImageToCloudinary(request.ImageUrl, userId);
        var result = await _identityService.UpdateUserAvatarAsync(avatarUrl,userId);
        return result;
    }
}


