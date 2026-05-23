using Edunary.Application.Common.Models;
using Edunary.Application.Topics.Commands.CreateTopicCommand;
using Edunary.Application.Topics.Commands.DeleteTopicCommand;
using Edunary.Application.Topics.Commands.UpdateTopicCommand;
using Edunary.Application.Topics.Queries.GetTopicsQuery;
using Edunary.Domain.Constants;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class Topics : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetTopics);

        // Admin
        app.MapGroup(this)
            .RequireAuthorization(Policies.Admin)
            .MapPost(CreateTopic, "admin")
            .MapPut(UpdateTopic, "admin")
            .MapDelete(DeleteTopic, "admin");
    }

    public async Task<PaginatedList<GetTopicDto>> GetTopics(ISender sender, [AsParameters] GetTopicsQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<ReturnResult<CreatedTopicDto>> CreateTopic(ISender sender, CreateTopicCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result> UpdateTopic(ISender sender, [FromBody] UpdateTopicCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result> DeleteTopic(ISender sender, [FromBody] DeleteTopicCommand command)
    {
        return await sender.Send(command);
    }
}
