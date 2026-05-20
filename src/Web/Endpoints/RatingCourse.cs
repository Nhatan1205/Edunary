using Edunary.Application.RatingCourses.Commands.UpsertRatingCourseCommand;
using Edunary.Application.RatingCourses.Queries.GetRatingCourseByUserQuery;
using Edunary.Application.RatingCourses.Queries.GetRatingsByCourseQuery;
using Edunary.Application.RatingCourses.Queries.GetInstructorReviewsQuery;
using Edunary.Application.RatingCourses.Commands.UpsertRatingResponseCommand;
using Edunary.Application.RatingCourses.Commands.DeleteRatingResponseCommand;
using Edunary.Application.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class RatingCourse : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(UpsertRatingCourse)
            .MapGet(GetRatingCourseByUser)
            .MapGet(GetInstructorReviews, "instructor")
            .MapPost(UpsertRatingResponse, "respond")
            .MapDelete(DeleteRatingResponse, "{id}/respond");

        app.MapGroup(this)
            .MapGet(GetRatingsByCourse, "course/{courseId}");
    }

    // Add new or update RatingCourse by user
    public async Task<IResult> UpsertRatingCourse(ISender sender, [FromBody] UpsertRatingCourseCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    // Get RatingCourse by user_id and course_id
    public async Task<RatingCourseDto> GetRatingCourseByUser(ISender sender, int courseId)
    {
        var query = new GetRatingCourseByUserQuery { CourseId = courseId };
        var result = await sender.Send(query);
        return result.Data as RatingCourseDto;
    }

    // Get all ratings for a course with pagination and filters
    public async Task<PaginatedList<RatingCourseWithUserDto>> GetRatingsByCourse(
        ISender sender, 
        int courseId,
        int pageNumber = 1,
        int pageSize = 10,
        int? filterRating = null,
        string sortBy = "newest")
    {
        var query = new GetRatingsByCourseQuery 
        { 
            CourseId = courseId,
            PageNumber = pageNumber,
            PageSize = pageSize,
            FilterRating = filterRating,
            SortBy = sortBy
        };
        return await sender.Send(query);
    }

    // Get instructor reviews
    public async Task<PaginatedList<InstructorReviewDto>> GetInstructorReviews(
        ISender sender,
        [AsParameters] GetInstructorReviewsQuery query)
    {
        return await sender.Send(query);
    }

    // Create or update instructor response
    public async Task<IResult> UpsertRatingResponse(ISender sender, [FromBody] UpsertRatingResponseCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    // Delete instructor response
    public async Task<IResult> DeleteRatingResponse(ISender sender, int id)
    {
        var command = new DeleteRatingResponseCommand { RatingCourseId = id };
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
}
