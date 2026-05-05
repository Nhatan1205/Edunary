using Edunary.Application.Common.Models;
using Edunary.Application.Quizzes.Commands.CreateQuizCommand;
using Edunary.Application.Quizzes.Commands.DeleteQuizCommand;
using Edunary.Application.Quizzes.Commands.LinkQuizToItemCommand;
using Edunary.Application.Quizzes.Commands.UpdateQuizCommand;
using Edunary.Application.Quizzes.Commands.UpdateQuizQuestionsCommand;
using Edunary.Application.Quizzes.Queries.GetQuizByItemIdQuery;
using Edunary.Application.Quizzes.Queries.GetQuizzesByCourseQuery;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class Quizzes : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetQuizByItemId, "item/{courseId}/{itemId}")
            .MapGet(GetQuizzesByCourse, "course/{courseId}")
            .MapPost(CreateQuiz)
            .MapPut(UpdateQuiz, "settings/{quizId}")
            .MapPut(UpdateQuizQuestions, "questions/{quizId}")
            .MapPut(LinkQuizToItem, "link/{quizId}")
            .MapDelete(DeleteQuiz, "{quizId}");
    }

    public async Task<QuizDto> GetQuizByItemId(ISender sender, int courseId, string itemId)
    {
        return await sender.Send(new GetQuizByItemIdQuery { CourseId = courseId, ItemId = itemId });
    }

    public async Task<List<QuizSummaryDto>> GetQuizzesByCourse(ISender sender, int courseId)
    {
        return await sender.Send(new GetQuizzesByCourseQuery { CourseId = courseId });
    }

    public async Task<IResult> LinkQuizToItem(ISender sender, int quizId, [FromBody] LinkQuizToItemCommand command)
    {
        if (quizId != command.QuizId) return Results.BadRequest();
        Result result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }

    public async Task<ReturnResult<int>> CreateQuiz(ISender sender, [FromBody] CreateQuizCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<IResult> UpdateQuiz(ISender sender, int quizId, [FromBody] UpdateQuizCommand command)
    {
        if (quizId != command.QuizId) return Results.BadRequest();
        Result result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }

    public async Task<IResult> UpdateQuizQuestions(ISender sender, int quizId, [FromBody] UpdateQuizQuestionsCommand command)
    {
        if (quizId != command.QuizId) return Results.BadRequest();
        Result result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }

    public async Task<IResult> DeleteQuiz(ISender sender, int quizId)
    {
        Result result = await sender.Send(new DeleteQuizCommand { QuizId = quizId });
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }
}
