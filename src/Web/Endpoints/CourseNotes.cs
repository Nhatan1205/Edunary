using Edunary.Application.CourseNotes.Commands.CreateCourseNoteCommand;
using Edunary.Application.CourseNotes.Commands.DeleteCourseNoteCommand;
using Edunary.Application.CourseNotes.Commands.UpdateCourseNoteCommand;
using Edunary.Application.CourseNotes.Queries.GetCourseNotesByVideo;

namespace Edunary.Web.Endpoints;

public class CourseNotes : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetCourseNotesByVideo, "/video")
            .MapPost(CreateCourseNote)
            .MapPut(UpdateCourseNote, "/{noteId}")
            .MapDelete(DeleteCourseNote, "/{noteId}");
    }

    public async Task<List<CourseNoteDto>> GetCourseNotesByVideo(
        ISender sender, int courseId, int videoId)
    {
        return await sender.Send(new GetCourseNotesByVideoQuery
        {
            CourseId = courseId,
            VideoId = videoId
        });
    }

    public async Task<IResult> CreateCourseNote(ISender sender, CreateCourseNoteCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded
            ? Results.Ok(result)
            : Results.BadRequest(result);
    }

    public async Task<IResult> UpdateCourseNote(ISender sender, int noteId, UpdateCourseNoteCommand command)
    {
        if (noteId != command.NoteId)
            return Results.BadRequest("Note ID mismatch");

        var result = await sender.Send(command);
        return result.Succeeded
            ? Results.Ok(result)
            : Results.BadRequest(result);
    }

    public async Task<IResult> DeleteCourseNote(ISender sender, int noteId)
    {
        var result = await sender.Send(new DeleteCourseNoteCommand { NoteId = noteId });
        return result.Succeeded
            ? Results.Ok(result)
            : Results.BadRequest(result);
    }
}
