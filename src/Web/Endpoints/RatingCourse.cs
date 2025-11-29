using Edunary.Application.RatingCourses.Commands.UpsertRatingCourseCommand;
using Edunary.Application.RatingCourses.Queries.GetRatingCourseByUserQuery;
using Edunary.Application.RatingCourses.Queries.GetRatingsByCourseQuery;
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
            .MapGet(GetRatingCourseByUser);

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
}
