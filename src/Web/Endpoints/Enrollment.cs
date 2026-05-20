using Edunary.Application.Common.Models;
using Edunary.Application.Enrollments.Queries.CheckUserEnrollmentQuery;
using Edunary.Application.Enrollments.Queries.GetInstructorRecentStudentsQuery;
using Edunary.Application.Enrollments.Queries.GetInstructorStudentDetailQuery;
using Edunary.Application.Enrollments.Queries.GetInstructorStudentsQuery;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class Enrollment : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(CheckEnrollment, "check/{courseId:int}")
            .MapGet(GetInstructorRecentStudents, "instructor/recent-students")
            .MapGet(GetInstructorStudents, "instructor/students")
            .MapGet(GetInstructorStudentDetail, "instructor/students/{studentId}");
    }

    public async Task<CheckUserEnrollmentDto> CheckEnrollment(ISender sender, int courseId)
    {
        var query = new CheckUserEnrollmentQuery(courseId);
        var result = await sender.Send(query);
        return result;
    }

    public async Task<InstructorRecentStudentsDto> GetInstructorRecentStudents(ISender sender)
    {
        return await sender.Send(new GetInstructorRecentStudentsQuery());
    }

    public async Task<PaginatedList<InstructorStudentDto>> GetInstructorStudents(ISender sender, [AsParameters] GetInstructorStudentsQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<InstructorStudentDetailDto> GetInstructorStudentDetail(ISender sender, string studentId)
    {
        return await sender.Send(new GetInstructorStudentDetailQuery(studentId));
    }
}
