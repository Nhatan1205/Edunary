using Edunary.Application.Enrollments.Queries.CheckUserEnrollmentQuery;

namespace Edunary.Web.Endpoints;

public class Enrollment : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(CheckEnrollment, "check/{courseId:int}");
    }

    public async Task<CheckUserEnrollmentDto> CheckEnrollment(ISender sender, int courseId)
    {
        var query = new CheckUserEnrollmentQuery(courseId);
        var result = await sender.Send(query);
        return result;
    }
}