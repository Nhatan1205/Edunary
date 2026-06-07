
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Courses.Commands.CreateCourse;
using Edunary.Application.Courses.Commands.DeleteCourse;
using Edunary.Application.Courses.Commands.UpdateCourse;
using Edunary.Application.Courses.Commands.UpdateCoursePricing;
using Edunary.Application.Courses.Commands.UnpublishCourseCommand;
using Edunary.Application.Courses.Queries.GetCourseById;
using Edunary.Application.Courses.Queries.GetCoursesAuthorWithPagination;
using Edunary.Application.Courses.Queries.GetCoursesHomepageQuery;
using Edunary.Application.Courses.Queries.GetCoursesStatsQuery;
using Edunary.Application.Courses.Queries.GetCourseStatsQuery;
using Edunary.Application.Courses.Queries.GetCoursesWithPagination;
using Edunary.Application.Courses.Queries.GetEnrolledCoursesQuery;
using Edunary.Application.Courses.Queries.GetHomepageCoursesQuery;
using Edunary.Application.Courses.Queries.GetPublicCourseById;
using Edunary.Application.Courses.Queries.GetPublicCoursesByUserIdQuery;
using Edunary.Application.Courses.Queries.GetPublishedCoursesForAdminQuery;
using Edunary.Application.Courses.Queries.GetCourseManagementStatsQuery;
using Edunary.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using static Microsoft.EntityFrameworkCore.Query.Internal.ExpressionTreeFuncletizer;

namespace Edunary.Web.Endpoints;

public class Courses : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(CreateCourse)
            .MapGet(GetCoursesAuthorWithPagination, "author")
            .MapGet(GetEnrolledCoursesWithPagination, "student")
            .MapGet(GetCourseById, "{id}")
            .MapGet(GetCourseStats,"stats")
            .MapPut(UpdateCourse)
            .MapPut(UpdateCoursePricing, "pricing")
            .MapDelete(DeleteCourse);

        // Admin endpoints
        app.MapGroup(this)
            .RequireAuthorization(Policies.Admin)
            .MapPost(UnpublishCourse, "admin/unpublish")
            .MapGet(GetPublishedCoursesForAdmin, "admin/published")
            .MapGet(GetCourseManagementStats, "admin/course-stats");

        // Public endpoint without authorization
        app.MapGroup(this)
            .MapPost(GetCoursesWithPagination,"search")
            .MapGet(GetHomepageCourses, "homepage")
            .MapGet(GetPublicCourseById, "public/{id}")
            .MapGet(GetPublicCoursesByUserId, "public/user/{userId}");

    }

    public async Task<ReturnResult<CreatedCourseDto>> CreateCourse(ISender sender, CreateCourseCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<IResult> UpdateCourse(ISender sender, [FromBody] UpdateCourseCommand command)
    {

        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> UpdateCoursePricing(ISender sender, [FromBody] UpdateCoursePricingCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> DeleteCourse(ISender sender, [FromBody] DeleteCourseCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<PaginatedList<GetCourseDto>> GetCoursesWithPagination(ISender sender, [FromBody] GetCoursesWithPaginationQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<HomepageCoursesVm> GetHomepageCourses(ISender sender, ICurrentUserService currentUserService)
    {
        var query = new GetHomepageCoursesQuery { UserId = currentUserService.UserId };
        return await sender.Send(query);
    }

    public async Task<PaginatedList<GetCoursesAuthorDto>> GetCoursesAuthorWithPagination(ISender sender, [AsParameters] GetCoursesAuthorWithPaginationQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<PaginatedList<EnrolledCoursesDto>> GetEnrolledCoursesWithPagination(ISender sender, [AsParameters] GetEnrolledCoursesQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<CourseStatsVM> GetCourseStats(ISender sender, [AsParameters] GetCourseStatsQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<GetCourseByIdDto> GetCourseById(ISender sender, int id)
    {
        return await sender.Send(new GetCourseByIdQuery() { Id = id });
    }

    public async Task<GetPublicCourseByIdDto> GetPublicCourseById(ISender sender,
        ICurrentUserService currentUserService, int id)
    {
        return await sender.Send(new GetPublicCourseByIdQuery { Id = id, UserId = currentUserService.UserId });
    }

    public async Task<PaginatedList<PublicCoursesByUserIdDto>> GetPublicCoursesByUserId(ISender sender, [AsParameters] GetPublicCoursesByUserIdQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<IResult> UnpublishCourse(ISender sender, [FromBody] UnpublishCourseCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<PaginatedList<PublishedCourseForAdminDto>> GetPublishedCoursesForAdmin(ISender sender, [AsParameters] GetPublishedCoursesForAdminQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<CourseManagementStatsDto> GetCourseManagementStats(ISender sender)
    {
        return await sender.Send(new GetCourseManagementStatsQuery());
    }

}


