using Edunary.Application.Common.Models;
using Edunary.Application.CourseAnswers.Commands.CreateCourseAnswerCommand;
using Edunary.Application.CourseAnswers.Commands.DeleteCourseAnswerCommand;
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
            .MapDelete(DeleteCourseAnswer, "/{answerId}");
    }

    public async Task<PaginatedList<CourseAnswerDto>> GetCourseAnswers(ISender sender,[AsParameters] GetCourseAnswersQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<ReturnResult<CreatedCourseAnswerDto>> CreateCourseAnswer(ISender sender, CreateCourseAnswerCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<IResult> DeleteCourseAnswer(ISender sender, [FromBody] DeleteCourseAnswerCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
}
