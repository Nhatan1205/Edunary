using System.Text.Json;
using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Common;
using Edunary.Domain.Enums;

namespace Edunary.Application.Users.Commands.UpdateUserInfoCommand;


[ActivityLog(ActivityType.UpdateUserInfo, "Update User information")]
public class UpdateUserInfoCommand : IRequest<Result>
{
    public string FullName { get; init; }
    public string PhoneNumber { get; init; }
    public string Headline { get; init; }
    public string Description { get; init; }
    public UserLinksDto Links { get; init; }
}

public class UpdateUserInfoCommandHandler : IRequestHandler<UpdateUserInfoCommand, Result>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserEmbeddingJobService _userEmbeddingJobService;

    public UpdateUserInfoCommandHandler(
        IIdentityService identityService,
        ICurrentUserService currentUserService,
        IUserEmbeddingJobService userEmbeddingJobService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
        _userEmbeddingJobService = userEmbeddingJobService;
    }
    public async Task<Result> Handle(UpdateUserInfoCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Result.Failure("User not authenticated");
        }

        var userModel = new UserModel
        {
            Id = userId,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            Headline = request.Headline,
            Description = request.Description,
            Links = JsonSerializer.Serialize(request.Links)
        };

        var result = await _identityService.UpdateUserAsync(userModel);

        // Re-embed the user's Qdrant vector when their full name changes,
        // since the full name is part of the searchable embedding text.
        if (result.Succeeded && !string.IsNullOrEmpty(request.FullName))
        {
            _userEmbeddingJobService.EnqueueUserProfileEmbedding(userId);
        }

        return result;
    }
}
