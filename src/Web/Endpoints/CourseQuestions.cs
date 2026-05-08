using Edunary.Application.Common.Models;
using Edunary.Application.CourseQuestions.Commands.CreateCourseQuestionCommand;
using Edunary.Application.CourseQuestions.Commands.DeleteCourseQuestionCommand;
using Edunary.Application.CourseQuestions.Commands.ToggleFeaturedCommand;
using Edunary.Application.CourseQuestions.Commands.ToggleQuestionUpvoteCommand;
using Edunary.Application.CourseQuestions.Commands.ToggleReadStatusCommand;
using Edunary.Application.CourseQuestions.Queries.GetCourseQuestions;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class CourseQuestions : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetCourseQuestions)
            .MapPost(CreateCourseQuestion)
            .MapDelete(DeleteCourseQuestion, "/{questionId}")
            .MapPost(ToggleQuestionUpvote, "/{questionId}/upvote")
            .MapPut(ToggleFeatured, "/{questionId}/featured")
            .MapPut(ToggleReadStatus, "/{questionId}/read-status");
    }

    public async Task<PaginatedList<CourseQuestionDto>> GetCourseQuestions(ISender sender, [AsParameters] GetCourseQuestionsQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<ReturnResult<CreatedCourseQuestionDto>> CreateCourseQuestion(ISender sender, CreateCourseQuestionCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<IResult> DeleteCourseQuestion(ISender sender, [FromBody] DeleteCourseQuestionCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> ToggleQuestionUpvote(ISender sender, int questionId)
    {
        var result = await sender.Send(new ToggleQuestionUpvoteCommand { QuestionId = questionId });
        if (result.Result is null)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> ToggleFeatured(ISender sender, int questionId)
    {
        var result = await sender.Send(new ToggleFeaturedCommand { QuestionId = questionId });
        if (result.Result is null)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> ToggleReadStatus(ISender sender, int questionId)
    {
        var result = await sender.Send(new ToggleReadStatusCommand { QuestionId = questionId });
        if (result.Result is null)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
}
