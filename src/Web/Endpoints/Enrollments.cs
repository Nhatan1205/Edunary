using Edunary.Application.Enrollments.Queries;
using System.Security.Claims;

namespace Edunary.Web.Endpoints;

public class Enrollments : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(CheckEnrollment, "check/{courseId:int}");
    }

    public async Task<CheckUserEnrollmentResponse> CheckEnrollment(ISender sender, int courseId, ClaimsPrincipal user)
    {
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var query = new CheckUserEnrollmentQuery(courseId, userId ?? string.Empty);
        var result = await sender.Send(query);
        return result;
    }
}