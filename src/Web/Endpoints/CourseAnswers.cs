using Edunary.Application.Common.Models;
using Edunary.Application.CourseAnswers.Commands.CreateCourseAnswerCommand;
using Edunary.Application.CourseAnswers.Commands.DeleteCourseAnswerCommand;
using Edunary.Application.CourseAnswers.Commands.ToggleAnswerUpvoteCommand;
using Edunary.Application.CourseAnswers.Commands.ToggleTopAnswerCommand;
using Edunary.Application.CourseAnswers.Commands.UpdateCourseAnswerCommand;
using Edunary.Application.CourseAnswers.Queries.GetCourseAnswers;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class CourseAnswers : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetCourseAnswers)
            .MapPost(CreateCourseAnswer)
            .MapPut(UpdateCourseAnswer, "/{answerId}")
            .MapDelete(DeleteCourseAnswer, "/{answerId}")
            .MapPost(ToggleAnswerUpvote, "/{answerId}/upvote")
            .MapPut(ToggleTopAnswer, "/{answerId}/top-answer");
    }

    public async Task<PaginatedList<CourseAnswerDto>> GetCourseAnswers(ISender sender, [AsParameters] GetCourseAnswersQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<ReturnResult<CreatedCourseAnswerDto>> CreateCourseAnswer(ISender sender, CreateCourseAnswerCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<IResult> UpdateCourseAnswer(ISender sender, int answerId, UpdateCourseAnswerCommand command)
    {
        var result = await sender.Send(command with { AnswerId = answerId });
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> DeleteCourseAnswer(ISender sender, int answerId)
    {
        var result = await sender.Send(new DeleteCourseAnswerCommand { AnswerId = answerId });
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> ToggleAnswerUpvote(ISender sender, int answerId)
    {
        var result = await sender.Send(new ToggleAnswerUpvoteCommand { AnswerId = answerId });
        if (result.Result is null)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> ToggleTopAnswer(ISender sender, int answerId)
    {
        var result = await sender.Send(new ToggleTopAnswerCommand { AnswerId = answerId });
        if (result.Result is null)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
}
