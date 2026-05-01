using Edunary.Application.Common.Models;
using Edunary.Application.Roadmaps.Commands.CreateRoadmapCommand;
using Edunary.Application.Roadmaps.Commands.DeleteRoadmapCommand;
using Edunary.Application.Roadmaps.Commands.UpdateRoadmapCommand;
using Edunary.Application.Roadmaps.Queries.GetPublicRoadmapDetailQuery;
using Edunary.Application.Roadmaps.Queries.GetRelatedRoadmapsByCourseIdQuery;
using Edunary.Application.Roadmaps.Queries.GetPublicRoadmapsQuery;
using Edunary.Application.Roadmaps.Queries.GetRoadmapDetailQuery;
using Edunary.Application.Roadmaps.Queries.GetRoadmapsAuthorQuery;
using Edunary.Application.Roadmaps.Queries.GetRoadmapTopicsQuery;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Edunary.Application.Roadmaps.Commands.GenerateAIRoadmapCommand;

namespace Edunary.Web.Endpoints;

public class Roadmaps : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(CreateRoadmap)
            .MapPost(GenerateAIRoadmap, "generate")
            .MapPut(UpdateRoadmap)
            .MapDelete(DeleteRoadmap)
            .MapGet(GetRoadmapsAuthor)
            .MapGet(GetRoadmapDetail, "{id}");

        app.MapGroup(this)
            .MapGet(GetPublicRoadmaps, "public")
            .MapGet(GetPublicRoadmapDetail, "public/{id}")
            .MapGet(GetRoadmapTopics, "public/topics")
            .MapGet(GetRelatedRoadmapsByCourseId, "public/course/{courseId}");
    }

    public async Task<ReturnResult<CreatedRoadmapDto>> CreateRoadmap(ISender sender, CreateRoadmapCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<List<RoadmapTopicDto>> GetRoadmapTopics(ISender sender)
    {
        return await sender.Send(new GetRoadmapTopicsQuery());
    }

    public async Task<IResult> UpdateRoadmap(ISender sender, UpdateRoadmapCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    public async Task<PaginatedList<RoadmapAuthorDto>> GetRoadmapsAuthor(ISender sender, [AsParameters] GetRoadmapsAuthorQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<RoadmapDetailDto> GetRoadmapDetail(ISender sender, int id)
    {
        return await sender.Send(new GetRoadmapDetailQuery { Id = id });
    }

    public async Task<IResult> DeleteRoadmap(ISender sender, [FromBody] DeleteRoadmapCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    public async Task<PaginatedList<PublicRoadmapListDto>> GetPublicRoadmaps(ISender sender, [AsParameters] GetPublicRoadmapsQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<PublicRoadmapDetailDto> GetPublicRoadmapDetail(ISender sender, int id)
    {
        return await sender.Send(new GetPublicRoadmapDetailQuery { Id = id });
    }

    public async Task<List<RelatedRoadmapDto>> GetRelatedRoadmapsByCourseId(ISender sender, int courseId)
    {
        return await sender.Send(new GetRelatedRoadmapsByCourseIdQuery { CourseId = courseId });
    }

    public async Task<ReturnResult<GeneratedAIRoadmapDto>> GenerateAIRoadmap(ISender sender, [FromBody] GenerateAIRoadmapCommand command)
    {
        return await sender.Send(command);
    }
}

