using Edunary.Application.CourseCollaborators.Commands.AcceptInvitationCommand;
using Edunary.Application.CourseCollaborators.Commands.DeclineInvitationCommand;
using Edunary.Application.CourseCollaborators.Commands.InviteCollaboratorCommand;
using Edunary.Application.CourseCollaborators.Commands.LeaveCollaborationCommand;
using Edunary.Application.CourseCollaborators.Commands.RemoveCollaboratorCommand;
using Edunary.Application.CourseCollaborators.Commands.UpdateCollaboratorCommand;
using Edunary.Application.CourseCollaborators.Queries.GetCollaboratorsQuery;
using Edunary.Application.CourseCollaborators.Queries.GetMyInvitationsQuery;

namespace Edunary.Web.Endpoints;

public class CourseCollaborators : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetCollaborators, "/{courseId:int}")
            .MapPost(InviteCollaborator, "/{courseId:int}/invite")
            .MapPut(UpdateCollaborator, "/{courseId:int}/{collaboratorId:int}")
            .MapDelete(RemoveCollaborator, "/{courseId:int}/{collaboratorId:int}")
            .MapPost(LeaveCollaboration, "/{courseId:int}/leave")
            .MapGet(GetMyInvitations, "/invitations")
            .MapPost(AcceptInvitation, "/invitations/{collaboratorId:int}/accept")
            .MapPost(DeclineInvitation, "/invitations/{collaboratorId:int}/decline");
    }

    public async Task<List<CollaboratorDto>> GetCollaborators(ISender sender, int courseId)
        => await sender.Send(new GetCollaboratorsQuery { CourseId = courseId });

    public async Task<IResult> InviteCollaborator(ISender sender, int courseId, InviteCollaboratorCommand command)
    {
        if (courseId != command.CourseId) return Results.BadRequest("CourseId mismatch.");
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> UpdateCollaborator(ISender sender, int courseId, int collaboratorId, UpdateCollaboratorCommand command)
    {
        if (courseId != command.CourseId || collaboratorId != command.CollaboratorId)
            return Results.BadRequest("ID mismatch.");
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> RemoveCollaborator(ISender sender, int courseId, int collaboratorId)
    {
        var result = await sender.Send(new RemoveCollaboratorCommand { CourseId = courseId, CollaboratorId = collaboratorId });
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> LeaveCollaboration(ISender sender, int courseId)
    {
        var result = await sender.Send(new LeaveCollaborationCommand { CourseId = courseId });
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<List<InvitationDto>> GetMyInvitations(ISender sender)
        => await sender.Send(new GetMyInvitationsQuery());

    public async Task<IResult> AcceptInvitation(ISender sender, int collaboratorId)
    {
        var result = await sender.Send(new AcceptInvitationCommand { CollaboratorId = collaboratorId });
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> DeclineInvitation(ISender sender, int collaboratorId)
    {
        var result = await sender.Send(new DeclineInvitationCommand { CollaboratorId = collaboratorId });
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}
