using Edunary.Application.Common.Models;
using Edunary.Application.QuizAttempts.Commands.CacheQuizAnswerCommand;
using Edunary.Application.QuizAttempts.Commands.StartQuizAttemptCommand;
using Edunary.Application.QuizAttempts.Commands.SubmitQuizAttemptCommand;
using Edunary.Application.QuizAttempts.Queries.GetAttemptHistoryQuery;
using Edunary.Application.QuizAttempts.Queries.GetAttemptResultQuery;
using Edunary.Application.QuizAttempts.Queries.GetCachedAnswersQuery;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class QuizAttempts : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(StartAttempt, "start/{quizId}")
            .MapPost(CacheAnswer, "cache-answer")
            .MapGet(GetCachedAnswers, "cached-answers/{attemptId}/{quizId}")
            .MapPost(SubmitAttempt, "submit")
            .MapGet(GetAttemptResult, "result/{attemptId}")
            .MapGet(GetAttemptHistory, "history/{quizId}");
    }

    public async Task<ReturnResult<StartAttemptResultDto>> StartAttempt(ISender sender, int quizId)
    {
        return await sender.Send(new StartQuizAttemptCommand { QuizId = quizId });
    }

    public async Task<IResult> CacheAnswer(ISender sender, [FromBody] CacheQuizAnswerCommand command)
    {
        Result result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }

    public async Task<CachedAnswersDto> GetCachedAnswers(ISender sender, int attemptId, int quizId)
    {
        return await sender.Send(new GetCachedAnswersQuery { AttemptId = attemptId, QuizId = quizId });
    }

    public async Task<ReturnResult<SubmitResultDto>> SubmitAttempt(ISender sender, [FromBody] SubmitQuizAttemptCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<AttemptResultDto> GetAttemptResult(ISender sender, int attemptId)
    {
        return await sender.Send(new GetAttemptResultQuery { AttemptId = attemptId });
    }

    public async Task<List<AttemptHistoryItemDto>> GetAttemptHistory(ISender sender, int quizId)
    {
        return await sender.Send(new GetAttemptHistoryQuery { QuizId = quizId });
    }
}
