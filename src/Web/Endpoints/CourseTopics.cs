using Edunary.Application.Common.Models;
using Edunary.Application.CourseTopics.Commands.CreateCourseTopic;
using Edunary.Application.CourseTopics.Commands.DeleteCourseTopic;
using Edunary.Application.CourseTopics.Commands.UpdateCourseTopic;
using Edunary.Application.CourseTopics.Queries.GetCourseTopics;
using Edunary.Domain.Constants;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class CourseTopics : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetCourseTopics);

        // Admin
        app.MapGroup(this)
            .RequireAuthorization(Policies.SuperAdmin)
            .MapPost(CreateCourseTopic, "admin")
            .MapPut(UpdateCourseTopic, "admin")
            .MapDelete(DeleteCourseTopic, "admin");
    }

    public async Task<PaginatedList<GetCourseTopicDto>> GetCourseTopics(ISender sender, [AsParameters] GetCourseTopicsQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<ReturnResult<CreatedCourseTopicDto>> CreateCourseTopic(ISender sender, CreateCourseTopicCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result> UpdateCourseTopic(ISender sender, [FromBody] UpdateCourseTopicCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result> DeleteCourseTopic(ISender sender, [FromBody] DeleteCourseTopicCommand command)
    {
        return await sender.Send(command);
    }
}
