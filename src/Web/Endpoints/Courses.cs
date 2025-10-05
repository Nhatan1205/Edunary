
using Edunary.Application.Courses.Commands.CreateCourse;

namespace Edunary.Web.Endpoints;

public class Courses : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapPost(CreateCourse);
    }

    public async Task<IResult> CreateCourse(ISender sender, CreateCourseCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
}
