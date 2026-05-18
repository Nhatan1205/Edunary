using Edunary.Application.Assignments.Commands.CreateAssignmentCommand;
using Edunary.Application.Assignments.Commands.DeleteAssignmentCommand;
using Edunary.Application.Assignments.Commands.LinkAssignmentToItemCommand;
using Edunary.Application.Assignments.Commands.PublishAssignmentCommand;
using Edunary.Application.Assignments.Commands.UpdateAssignmentCommand;
using Edunary.Application.Assignments.Commands.UpdateAssignmentQuestionsCommand;
using Edunary.Application.Assignments.Queries.GetAssignmentByItemIdQuery;
using Edunary.Application.Assignments.Queries.GetAssignmentsByCourseQuery;
using Edunary.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class Assignments : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetAssignmentByItemId, "item/{courseId}/{itemId}")
            .MapGet(GetAssignmentsByCourse, "course/{courseId}")
            .MapPost(CreateAssignment)
            .MapPut(UpdateAssignment, "settings/{assignmentId}")
            .MapPut(UpdateAssignmentQuestions, "questions/{assignmentId}")
            .MapPut(PublishAssignment, "publish/{assignmentId}")
            .MapPut(LinkAssignmentToItem, "link/{assignmentId}")
            .MapDelete(DeleteAssignment, "batch");
    }

    public async Task<AssignmentDto> GetAssignmentByItemId(ISender sender, int courseId, string itemId)
    {
        return await sender.Send(new GetAssignmentByItemIdQuery { CourseId = courseId, ItemId = itemId });
    }

    public async Task<List<AssignmentSummaryDto>> GetAssignmentsByCourse(ISender sender, int courseId)
    {
        return await sender.Send(new GetAssignmentsByCourseQuery { CourseId = courseId });
    }

    public async Task<ReturnResult<int>> CreateAssignment(ISender sender, [FromBody] CreateAssignmentCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<IResult> UpdateAssignment(ISender sender, int assignmentId, [FromBody] UpdateAssignmentCommand command)
    {
        if (assignmentId != command.AssignmentId)
        {
            return Results.BadRequest();
        }
        Result result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }

    public async Task<IResult> UpdateAssignmentQuestions(ISender sender, int assignmentId, [FromBody] UpdateAssignmentQuestionsCommand command)
    {
        if (assignmentId != command.AssignmentId)
        {
            return Results.BadRequest();
        }
        Result result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }

    public async Task<IResult> PublishAssignment(ISender sender, int assignmentId, [FromBody] PublishAssignmentCommand command)
    {
        if (assignmentId != command.AssignmentId)
        {
            return Results.BadRequest();
        }
        Result result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }

    public async Task<IResult> LinkAssignmentToItem(ISender sender, int assignmentId, [FromBody] LinkAssignmentToItemCommand command)
    {
        if (assignmentId != command.AssignmentId)
        {
            return Results.BadRequest();
        }
        Result result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }

    public async Task<IResult> DeleteAssignment(ISender sender, [FromBody] DeleteAssignmentCommand command)
    {
        Result result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }
}
