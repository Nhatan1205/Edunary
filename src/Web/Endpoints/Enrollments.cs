using System.Security.Claims;
using Edunary.Application.Common.Models;
using Edunary.Application.Courses.Queries.GetCoursesAuthorWithPagination;
using Edunary.Application.Enrollments.Queries;
using Edunary.Application.Enrollments.Queries.GetCoursesByStudentIdQuery;
using Edunary.Application.Enrollments.Queries.GetCoursesByUserIdQuery;
using Edunary.Application.Enrollments.Queries.GetStudentsByCourseIdQuery;

namespace Edunary.Web.Endpoints;

public class Enrollments : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(CheckEnrollment, "check/{courseId:int}")
            .MapGet(GetCoursesByStudentId)  
            .MapGet(GetStudentsByCourseId, "{courseId}");
    }

    public async Task<CheckUserEnrollmentResponse> CheckEnrollment(ISender sender, int courseId, ClaimsPrincipal user)
    {
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var query = new CheckUserEnrollmentQuery(courseId, userId ?? string.Empty);
        var result = await sender.Send(query);
        return result;
    }

    public async Task<PaginatedList<GetCouresByStudentIdDto>> GetCoursesByStudentId(
        ISender sender, [AsParameters] GetCoursesByStudentIdWithPaginationQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<List<GetStudentsByCourseIdDto>> GetStudentsByCourseId(ISender sender, int courseId)
    {
        return await sender.Send(new GetStudentsByCourseIdQuery { CourseId = courseId });
    }
}
