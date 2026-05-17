using Edunary.Application.AssignmentSubmissions.Commands.CreateAssignmentFeedbackCommand;
using Edunary.Application.AssignmentSubmissions.Commands.DeleteAssignmentFeedbackCommand;
using Edunary.Application.AssignmentSubmissions.Commands.UpsertAssignmentSubmissionCommand;
using Edunary.Application.AssignmentSubmissions.Commands.ToggleSubmissionReadCommand;
using Edunary.Application.AssignmentSubmissions.Commands.UpdateAssignmentFeedbackCommand;
using Edunary.Application.AssignmentSubmissions.Queries.GetAssignmentDraftQuery;
using Edunary.Application.AssignmentSubmissions.Queries.GetStudentSubmissionQuery;
using Edunary.Application.AssignmentSubmissions.Queries.GetSubmissionsByAssignmentQuery;
using Edunary.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class AssignmentSubmissions : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(Upsert, "upsert")
            .MapGet(GetDraft, "draft/{assignmentId}")
            .MapGet(GetSubmissionsByAssignment, "list/{assignmentId}")
            .MapGet(GetStudentSubmission, "{submissionId}")
            .MapPut(ToggleRead, "read/{submissionId}")
            .MapPost(CreateFeedback, "feedback")
            .MapPut(UpdateFeedback, "feedback/{feedbackId}")
            .MapDelete(DeleteFeedback, "feedback/{feedbackId}");
    }

    public async Task<ReturnResult<int>> Upsert(ISender sender, [FromBody] UpsertAssignmentSubmissionCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<AssignmentDraftDto> GetDraft(ISender sender, int assignmentId)
    {
        return await sender.Send(new GetAssignmentDraftQuery { AssignmentId = assignmentId });
    }


    public async Task<PaginatedList<SubmissionListDto>> GetSubmissionsByAssignment(ISender sender, [AsParameters] GetSubmissionsByAssignmentQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<StudentSubmissionDto> GetStudentSubmission(ISender sender, int submissionId)
    {
        return await sender.Send(new GetStudentSubmissionQuery { SubmissionId = submissionId });
    }

    public async Task<IResult> ToggleRead(ISender sender, int submissionId, [FromBody] ToggleSubmissionReadCommand command)
    {
        if (submissionId != command.SubmissionId)
        {
            return Results.BadRequest();
        }
        Result result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }

    public async Task<ReturnResult<int>> CreateFeedback(ISender sender, [FromBody] CreateAssignmentFeedbackCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<IResult> UpdateFeedback(ISender sender, int feedbackId, [FromBody] UpdateAssignmentFeedbackCommand command)
    {
        if (feedbackId != command.FeedbackId)
        {
            return Results.BadRequest();
        }
        Result result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }

    public async Task<IResult> DeleteFeedback(ISender sender, int feedbackId)
    {
        Result result = await sender.Send(new DeleteAssignmentFeedbackCommand { FeedbackId = feedbackId });
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }
}
