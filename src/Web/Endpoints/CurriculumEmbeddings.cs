using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Constants;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Edunary.Web.Endpoints;

public class CurriculumEmbeddings : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization(Policies.Admin)
            .MapPost(BatchEmbedCurriculum, "batch-embed")
            .MapPost(EmbedSingleCurriculum, "{id:int}/embed")
            .MapDelete(DeleteSingleCurriculum, "{id:int}");
    }

    public IResult BatchEmbedCurriculum(ICourseCurriculumEmbeddingJobService embeddingJobService)
    {
        embeddingJobService.EnqueueBatchCurriculumEmbedding();
        return Results.Ok(new
        {
            message = "Batch course curriculum embedding job has been enqueued. Check the Hangfire dashboard for progress.",
            enqueuedAt = DateTime.UtcNow,
        });
    }

    public IResult EmbedSingleCurriculum(int id, ICourseCurriculumEmbeddingJobService embeddingJobService)
    {
        embeddingJobService.EnqueueCurriculumEmbedding(id);
        return Results.Ok(new
        {
            message = $"Curriculum embedding job enqueued for course ID {id}.",
            courseId = id,
            enqueuedAt = DateTime.UtcNow,
        });
    }

    public IResult DeleteSingleCurriculum(int id, ICourseCurriculumEmbeddingJobService embeddingJobService)
    {
        embeddingJobService.EnqueueCurriculumEmbeddingDeletion(id);
        return Results.Ok(new
        {
            message = $"Curriculum embedding deletion job enqueued for course ID {id}.",
            courseId = id,
            enqueuedAt = DateTime.UtcNow,
        });
    }
}
