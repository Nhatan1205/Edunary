using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.CourseDrafts.Queries.GetCourseCurriculumByIdQuery;
using Edunary.Application.Courses.Queries.GetCourseById;

namespace Edunary.Web.Endpoints;

public class CourseDrafts : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetCourseCurriculumById, "{id}");

    }
    public async Task<GetCourseByIdDto> GetCourseCurriculumById(ISender sender, int id)
    {
        return await sender.Send(new GetCourseCurriculumByIdQuery() { Id = id});
    }
}
