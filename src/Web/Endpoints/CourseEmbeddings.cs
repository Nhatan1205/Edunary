using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.CourseEmbeddings.Queries.GetCourseEmbeddingSyncStatus;
using Edunary.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class CourseEmbeddings : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization(Policies.SuperAdmin)
            .MapPost(BatchEmbed, "batch-embed")
            .MapGet(GetSyncStatus, "sync-status")
            .MapPost(EmbedSingle, "{id:int}/embed")
            .MapDelete(DeleteSingle, "{id:int}");
    }

    public IResult BatchEmbed(ICourseEmbeddingJobService embeddingJobService)
    {
        embeddingJobService.EnqueueBatchCourseEmbedding();
        return Results.Ok(new
        {
            message = "Batch course embedding job has been enqueued. Check the Hangfire dashboard for progress.",
            enqueuedAt = DateTime.UtcNow,
        });
    }

    public async Task<ReturnResult<CourseEmbeddingSyncStatusDto>> GetSyncStatus(
        ISender sender,
        [AsParameters] GetCourseEmbeddingSyncStatusQuery query)
    {
        return await sender.Send(query);
    }

    public IResult EmbedSingle(int id, ICourseEmbeddingJobService embeddingJobService)
    {
        embeddingJobService.EnqueueCourseEmbedding(id);
        return Results.Ok(new
        {
            message = $"Embedding job enqueued for course ID {id}.",
            courseId = id,
            enqueuedAt = DateTime.UtcNow,
        });
    }

    public IResult DeleteSingle(int id, ICourseEmbeddingJobService embeddingJobService)
    {
        embeddingJobService.EnqueueCourseEmbeddingDeletion(id);
        return Results.Ok(new
        {
            message = $"Embedding deletion job enqueued for course ID {id}.",
            courseId = id,
            enqueuedAt = DateTime.UtcNow,
        });
    }
}
