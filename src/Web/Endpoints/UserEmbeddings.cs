using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.UserEmbeddings.Queries.GetUserEmbeddingSyncStatus;
using Edunary.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class UserEmbeddings : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization(Policies.Admin)
            .MapPost(BatchEmbedUsers, "user-batch-embed")
            .MapGet(GetUserEmbeddingSyncStatus, "sync-status")
            .MapPost(EmbedSingleUser, "{userId}/embed");
    }

    public IResult BatchEmbedUsers(IUserEmbeddingJobService embeddingJobService)
    {
        embeddingJobService.EnqueueBatchUserProfileEmbedding();
        return Results.Ok(new
        {
            message = "Batch user profile embedding job has been enqueued. Check the Hangfire dashboard for progress.",
            enqueuedAt = DateTime.UtcNow,
        });
    }

    public async Task<ReturnResult<UserEmbeddingSyncStatusDto>> GetUserEmbeddingSyncStatus(
        ISender sender,
        [AsParameters] GetUserEmbeddingSyncStatusQuery query)
    {
        return await sender.Send(query);
    }

    public IResult EmbedSingleUser(string userId, IUserEmbeddingJobService embeddingJobService)
    {
        embeddingJobService.EnqueueUserProfileEmbedding(userId);
        return Results.Ok(new
        {
            message = $"Embedding job enqueued for user ID {userId}.",
            userId,
            enqueuedAt = DateTime.UtcNow,
        });
    }
}
