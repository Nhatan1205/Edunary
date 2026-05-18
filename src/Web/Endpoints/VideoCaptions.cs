using Edunary.Application.VideoCaptions.Commands.DeleteVideoCaption;
using Edunary.Application.VideoCaptions.Commands.GenerateAICaption;
using Edunary.Application.VideoCaptions.Commands.UpsertVideoCaption;
using Edunary.Application.VideoCaptions.Queries.GetCaptionLanguageQuery;
using Edunary.Application.VideoCaptions.Queries.GetVideoCaptionsByMediaFileId;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class VideoCaptions : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetCaptionLanguage, "/caption-language")
            .MapGet(GetVideoCaptions, "/{mediaFileId}")
            .MapPost(UpsertCaption, "/upsert")
            .MapPost(GenerateAICaption, "/generate-ai")
            .MapDelete(DeleteCaption, "/{id}");
    }

    public async Task<List<int>> GetCaptionLanguage(ISender sender, int CourseId)
    {
        var query = new GetCaptionLanguageQuery { CourseId = CourseId };
        return await sender.Send(query);
    }

    public async Task<List<VideoCaptionDto>> GetVideoCaptions(ISender sender, int mediaFileId)
    {
        return await sender.Send(new GetVideoCaptionsByMediaFileIdQuery { MediaFileId = mediaFileId });
    }

    public async Task<IResult> UpsertCaption(ISender sender, HttpRequest request)
    {
        var form = await request.ReadFormAsync();

        if (!int.TryParse(form["mediaFileId"], out var mediaFileId))
            return Results.BadRequest("Invalid mediaFileId.");

        if (!int.TryParse(form["language"], out var language))
            return Results.BadRequest("Invalid language.");

        var file = form.Files.GetFile("file");
        if (file == null || file.Length == 0)
            return Results.BadRequest("No file uploaded.");

        using var stream = file.OpenReadStream();

        var command = new UpsertVideoCaptionCommand
        {
            MediaFileId = mediaFileId,
            Language = language,
            FileStream = stream,
            FileName = file.FileName,
            FileSize = file.Length,
        };

        var result = await sender.Send(command);
        if (result.Succeeded)
        {
            return Results.Ok();
        }
        return Results.BadRequest(result);
    }

    public async Task<IResult> DeleteCaption(ISender sender, int id)
    {
        var result = await sender.Send(new DeleteVideoCaptionCommand { CaptionId = id });
        if (result.Succeeded)
        {
            return Results.Ok();
        }
        return Results.BadRequest(result);
    }

    public async Task<IResult> GenerateAICaption(ISender sender, [FromBody] GenerateAICaptionCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result);
    }
}
