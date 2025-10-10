
using Edunary.Application.Common.Models;
using Edunary.Application.Courses.Commands.CreateCourse;
using Edunary.Application.Courses.Commands.DeleteCourse;
using Edunary.Application.Courses.Commands.UpdateCourse;
using Edunary.Application.Courses.Queries.GetCourseById;
using Edunary.Application.Courses.Queries.GetCoursesAuthorWithPagination;
using Edunary.Application.Courses.Queries.GetCoursesWithPagination;
using Edunary.Application.Courses.Queries.GetPublicCourseById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class Courses : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(CreateCourse)
            .MapGet(GetCoursesAuthorWithPagination, "author")
            .MapGet(GetCourseById, "{id}")
            .MapPut(UpdateCourse)
            .MapDelete(DeleteCourse);

        // Public endpoint without authorization
        app.MapGroup(this)
            .MapGet(GetCoursesWithPagination)
            .MapGet(GetPublicCourseById, "public/{id}");
        
    }

    public async Task<IResult> CreateCourse(ISender sender, CreateCourseCommand command)
    {
        var result = await sender.Send(command);
        if(!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
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

    public async Task<IResult> DeleteCourse(ISender sender, [FromBody] DeleteCourseCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<PaginatedList<GetCourseDto>> GetCoursesWithPagination(ISender sender, [AsParameters] GetCoursesWithPaginationQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<PaginatedList<GetCoursesAuthorDto>> GetCoursesAuthorWithPagination(ISender sender, [AsParameters] GetCoursesAuthorWithPaginationQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<GetCourseByIdDto> GetCourseById(ISender sender, int id)
    {
        return await sender.Send(new GetCourseByIdQuery() { Id = id });
    }

    public async Task<GetPublicCourseByIdDto> GetPublicCourseById(ISender sender, int id)
    {
        return await sender.Send(new GetPublicCourseByIdQuery() { Id = id });
    }
}

