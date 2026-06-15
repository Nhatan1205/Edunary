using Edunary.Application.CourseAssistant.Commands.ClearCourseAssistantHistoryCommand;
using Edunary.Application.CourseAssistant.Commands.SendCourseAssistantMessageCommand;
using Edunary.Application.CourseAssistant.Queries.GetCourseAssistantHistoryQuery;
using Edunary.Application.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Edunary.Web.Endpoints;

public class CourseAssistants : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(SendCourseAssistantMessage)
            .MapGet(GetHistory, "{courseId}")
            .MapDelete(ClearHistory, "{courseId}");
    }

    public async Task<ReturnResult<CourseAssistantReplyDto>> SendCourseAssistantMessage(ISender sender, [FromBody] SendCourseAssistantMessageCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<ReturnResult<CourseAssistantHistoryDto>> GetHistory(ISender sender,[AsParameters] GetCourseAssistantHistoryQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<Result> ClearHistory(ISender sender, int courseId)
    {
        return await sender.Send(new ClearCourseAssistantHistoryCommand { CourseId = courseId });
    }
}
