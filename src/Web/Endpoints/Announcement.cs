using Edunary.Application.Announcements.Commands.CreateDraftAnnouncementCommand;
using Edunary.Application.Announcements.Commands.UpdateAnnouncementCommand;
using Edunary.Application.Announcements.Queries.GetAnnouncementsQuery;
using Edunary.Application.Announcements.Queries.GetAnnouncementByIdQuery;
using Edunary.Application.Common.Models;

namespace Edunary.Web.Endpoints;

public class Announcement : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(CreateAnnouncement)
            .MapPut(UpdateAnnouncement)
            .MapGet(GetAnnouncements)
            .MapGet(GetAnnouncementById, "{id}");



    }

    public async Task<ReturnResult<CreateAnnouncementCommandDto>> CreateAnnouncement(ISender sender, CreateAnnouncementCommand command)
    {
        return await sender.Send(command);
    }
    public async Task<IResult> UpdateAnnouncement(ISender sender, UpdateAnnouncementCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<PaginatedList<GetAnnouncementDto>> GetAnnouncements(ISender sender, [AsParameters] GetAnnouncementsQuery query)
    {
        return await sender.Send(query);
    }
    public async Task<GetAnnouncementByIdDto> GetAnnouncementById(ISender sender, int id)
    {
        return await sender.Send(new GetAnnouncementByIdQuery() { Id = id });
    }

}
