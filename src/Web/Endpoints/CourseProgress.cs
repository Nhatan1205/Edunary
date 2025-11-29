using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.CourseProgresses.Commands.UpdateCompleteCPCommand;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;
using Edunary.Application.CourseProgresses.Commands.UpdateCPByItemIdCommand;
using Edunary.Application.CourseProgresses.Queries.GetCourseProgressQuery;
using Edunary.Application.CourseProgresses.Queries.GetCPByItemIdQuery;
using Edunary.Application.CourseProgresses.Queries.GetLastAccessedItemQuery;
using Edunary.Application.CourseProgresses.Queries.GetLearningHeaderQuery;
using Edunary.Application.CourseProgresses.Queries.GetLearningSidebarQuery;

namespace Edunary.Web.Endpoints;

public class CourseProgress : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetCourseProgressByCourseId)
            .MapGet(GetLearningHeaderByCourseId, "/learning-header")
            .MapPut(UpdateCourseProgress)
            .MapGet(GetLearningSidebarByCourseId, "/learning-sidebar")
            .MapGet(GetCPByItemId, "/item/{itemId}")
            .MapPut(UpdateCPByItemId, "/item")
            .MapPut(UpdateCompleteCP, "/item/complete")
            .MapGet(GetLastAccessedItem, "/last-accessed-item");
    }
    public async Task<CourseProgressDto> GetCourseProgressByCourseId(ISender sender, int courseId)
    {
        var query = new GetCourseProgressQuery
        {
            CourseId = courseId
        };
        var result = await sender.Send(query);
        return result;
    }

    public async Task<LearningHeaderDto> GetLearningHeaderByCourseId(ISender sender, int courseId)
    {
        var query = new GetLearningHeaderQuery
        {
            CourseId = courseId
        };
        var result = await sender.Send(query);
        return result;
    }

    public async Task<IResult> UpdateCourseProgress(ISender sender, UpdateCourseProgressCommand command)
    {
        var result = await sender.Send(command);
        if (result.Succeeded)
        {
            return Results.Ok();
        }
        return Results.BadRequest();
    }

    public async Task<CourseProgressDto> GetLearningSidebarByCourseId(ISender sender, int courseId)
    {
        var query = new GetLearningSidebarQuery
        {
            CourseId = courseId
        };
        var result = await sender.Send(query);
        return result;
    }

    public async Task<CourseItemDto> GetCPByItemId(ISender sender, string itemId, int courseId)
    {
        var query = new GetCPByItemIdQuery
        {
            ItemId = itemId,
            CourseId = courseId
        };
        var result = await sender.Send(query);
        return result;
    }

    public async Task<IResult> UpdateCPByItemId(ISender sender, UpdateCPByItemIdCommand command)
    {
        var result = await sender.Send(command);
        if (result.Succeeded)
        {
            return Results.Ok();
        }
        return Results.BadRequest();
    }

    public async Task<IResult> UpdateCompleteCP(ISender sender, UpdateCompleteCPCommand command)
    {
        var result = await sender.Send(command);
        if (result.Succeeded)
        {
            return Results.Ok();
        }
        return Results.BadRequest();
    }

    public async Task<LastAccessedItemDto> GetLastAccessedItem(ISender sender, int courseId)
    {
        var query = new GetLastAccessedItemQuery
        {
            CourseId = courseId
        };
        var result = await sender.Send(query);
        return result;
    }
}
