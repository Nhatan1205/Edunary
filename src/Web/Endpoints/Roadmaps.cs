using Edunary.Application.Common.Models;
using Edunary.Application.Roadmaps.Commands.CreateRoadmapCommand;
using Edunary.Application.Roadmaps.Queries.GetRoadmapTopicsQuery;
using MediatR;

namespace Edunary.Web.Endpoints;

public class Roadmaps : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(CreateRoadmap);

        app.MapGroup(this)
            .MapGet(GetTopics, "public/topics");
    }

    public async Task<ReturnResult<CreatedRoadmapDto>> CreateRoadmap(ISender sender, CreateRoadmapCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<List<RoadmapTopicDto>> GetTopics(ISender sender)
    {
        return await sender.Send(new GetRoadmapTopicsQuery());
    }
}

