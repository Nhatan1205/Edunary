using Edunary.Application.Common.Models;
using Edunary.Application.CourseReviews.Commands.ApproveCourseCommand;
using Edunary.Application.CourseReviews.Commands.DeleteReviewFeedbackCommand;
using Edunary.Application.CourseReviews.Commands.RequestChangesCommand;
using Edunary.Application.CourseReviews.Commands.ResolveReviewFeedbackCommand;
using Edunary.Application.CourseReviews.Commands.SaveReviewFeedbackCommand;
using Edunary.Application.CourseReviews.Commands.SubmitCourseForReviewCommand;
using Edunary.Application.CourseReviews.Commands.UpdateReviewFeedbackCommand;
using Edunary.Application.CourseReviews.Queries.GetCoursePreviewForAdminQuery;
using Edunary.Application.CourseReviews.Queries.GetCourseReviewStatusQuery;
using Edunary.Application.CourseReviews.Queries.GetCourseReviewSubmissionsQuery;
using Edunary.Application.CourseReviews.Queries.GetCourseReviewSubmissionsCountsQuery;
using Edunary.Domain.Constants;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class CourseReviews : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(SubmitCourseForReview, "submit")
            .MapGet(GetCourseReviewStatus, "status/{courseId:int}")
            .MapPut(ResolveReviewFeedback, "feedback/{feedbackId:int}/resolve");

        app.MapGroup(this)
            .RequireAuthorization(Policies.Admin)
            .MapGet(GetCourseReviewSubmissions, "admin/pending")
            .MapGet(GetCourseReviewSubmissionsCounts, "admin/pending/counts")
            .MapGet(GetCoursePreviewForAdmin, "admin/preview/{submissionId:int}")
            .MapPost(SaveReviewFeedback, "admin/feedback")
            .MapPut(UpdateReviewFeedback, "admin/feedback/{feedbackId:int}")
            .MapDelete(DeleteReviewFeedback, "admin/feedback/{feedbackId:int}")
            .MapPost(RequestChanges, "admin/request-changes")
            .MapPost(ApproveCourse, "admin/approve");
    }


    //Instructor APIs
    public async Task<IResult> SubmitCourseForReview(ISender sender, [FromBody] SubmitCourseForReviewCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }


    public async Task<CourseReviewStatusDto> GetCourseReviewStatus(ISender sender, int courseId)
    {
        return await sender.Send(new GetCourseReviewStatusQuery { CourseId = courseId });
    }

    public async Task<IResult> ResolveReviewFeedback(ISender sender, int feedbackId, [FromBody] ResolveReviewFeedbackCommand command)
    {
        if (feedbackId != command.FeedbackId)
        {
            return Results.BadRequest("FeedbackId mismatch.");
        }
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    // Admin APIs

    public async Task<PaginatedList<CourseReviewSubmissionDto>> GetCourseReviewSubmissions(ISender sender, [AsParameters] GetCourseReviewSubmissionsQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<CourseReviewSubmissionsCountsDto> GetCourseReviewSubmissionsCounts(ISender sender, [AsParameters] GetCourseReviewSubmissionsCountsQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<AdminCoursePreviewDto> GetCoursePreviewForAdmin(ISender sender, int submissionId)
    {
        return await sender.Send(new GetCoursePreviewForAdminQuery { SubmissionId = submissionId });
    }

    public async Task<IResult> SaveReviewFeedback(ISender sender, [FromBody] SaveReviewFeedbackCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }

    public async Task<IResult> UpdateReviewFeedback(ISender sender, int feedbackId, [FromBody] UpdateReviewFeedbackCommand command)
    {
        if (feedbackId != command.FeedbackId)
        {
            return Results.BadRequest("FeedbackId mismatch.");
        }
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> DeleteReviewFeedback(ISender sender, int feedbackId)
    {
        var result = await sender.Send(new DeleteReviewFeedbackCommand { FeedbackId = feedbackId });
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> RequestChanges(ISender sender, [FromBody] RequestChangesCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> ApproveCourse(ISender sender, [FromBody] ApproveCourseCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}

