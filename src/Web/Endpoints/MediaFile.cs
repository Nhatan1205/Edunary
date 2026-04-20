using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.MediaFiles.Commands.AddLinkToMFCommand;
using Edunary.Application.MediaFiles.Commands.CreateMediaFileCommand;
using Edunary.Application.MediaFiles.Commands.DeleteMediaFileCommand;
using Edunary.Application.MediaFiles.Commands.GenerateUploadUrl;
using Edunary.Application.MediaFiles.Commands.InitiateChunkedUploadCommand;
using Edunary.Application.MediaFiles.Commands.SetCourseIdForContentCommand;
using Edunary.Application.MediaFiles.Commands.UploadChunkCommand;
using Edunary.Application.MediaFiles.Queries.GetMediaFileByUserIdQuery;
using Edunary.Application.MediaFiles.Queries.GetUploadStatusQuery;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using Edunary.Application.MediaFiles.Queries.CheckMediaFileAccessQuery;

namespace Edunary.Web.Endpoints;

public class MediaFile : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetMediaFilesByUserId)
            .MapDelete(DeleteMediaFileById)
            .MapPost(CheckFileExists, "/exists")
            .MapPost(SetCourseIdForContent, "/set-course-id")
            .MapPost(AddLinkToMediaFile, "/add-link")
            .MapPost(GenerateUploadUrl, "/generate-upload-url")
            .MapGet(GetHlsStream, "/hls/{videoId}/{*fileName}");

        app.MapGroup(this)
            .RequireAuthorization()
            .DisableAntiforgery()
            .MapPost(CreateMediaFile);

        app.MapGroup(this)
            .RequireAuthorization()
            .DisableAntiforgery()
            .MapPost(InitiateChunkedUpload, "/chunks/initiate")
            .MapPost(UploadChunk, "/chunks/upload")
            .MapGet(GetUploadStatus, "/chunks/{sessionId}/status");
            
    }

    public async Task<List<MediaFileDto>> GetMediaFilesByUserId(ISender sender)
    {
        var query = new GetMediaFileByUserId();
        var result = await sender.Send(query);
        return result;
    }

    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = 524288000, ValueLengthLimit = int.MaxValue)]
    public async Task<ReturnResult<MediaFileDto>> CreateMediaFile(ISender sender, [FromForm] IFormFile file, [FromForm] bool isOverride = false, [FromForm] int? courseId = null)
    {
        if (file == null || file.Length == 0)
        {
            var errorResult = new ReturnResult<MediaFileDto>
            {
                Message = "File not found."
            };
            return errorResult;
        }
        using var stream = file.OpenReadStream();
        var command = new CreateMediaFileCommand
        {
            File = stream,
            FileName = file.FileName,
            ContentType = file.ContentType,
            IsOverride = isOverride,
            CourseId = courseId
        };
        var result = await sender.Send(command);
        return result;
    }

    public async Task<IResult> DeleteMediaFileById(ISender sender, int id)
    {
        var command = new DeleteMediaFileCommand
        {
            Id = id
        };
        var result = await sender.Send(command);
        if (result.Succeeded)
        {
            return Results.Ok(result);
        }
        else
        {
            return Results.BadRequest(result);
        }
    }

    public async Task<bool> CheckFileExists(ISender sender, string fileName)
    {
        var query = new GetMediaFileByUserId();
        var contents = await sender.Send(query);
        return contents.Any(c => c.FileName == fileName);
    }

    public async Task<IResult> SetCourseIdForContent(ISender sender, SetCourseIdForContentCommand command)
    {
        var result = await sender.Send(command);
        if (result.Succeeded)
        {
            return Results.Ok(result);
        }
        else
        {
            return Results.BadRequest(result);
        }
    }
    
    public async Task<ReturnResult<MediaFileDto>> AddLinkToMediaFile(ISender sender, AddLinkToMFCommand command)
    {
        var result = await sender.Send(command);
        return result;
    }

    public async Task<ReturnResult<GenerateUploadUrlDto>> GenerateUploadUrl(ISender sender, GenerateUploadUrlCommand command)
    {
        var result = await sender.Send(command);
        return result;
    }

    public async Task<UploadSessionDto> InitiateChunkedUpload(ISender sender, InitiateChunkedUploadCommand command)
    {
        var result = await sender.Send(command);
        return result;
    }

    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = 524288000, ValueLengthLimit = int.MaxValue)]
    public async Task<UploadSessionDto> UploadChunk(ISender sender, [FromForm] IFormFile chunkFile, [FromForm] int sessionId, [FromForm] int chunkNumber, [FromForm] string chunkHash)
    {
        if (chunkFile == null || chunkFile.Length == 0)
        {
            throw new BadHttpRequestException("Chunk file not found.");
        }

        using var stream = chunkFile.OpenReadStream();
        var command = new UploadChunkCommand
        {
            SessionId = sessionId,
            ChunkNumber = chunkNumber,
            ChunkStream = stream,
            ChunkHash = chunkHash
        };

        var result = await sender.Send(command);
        return result;
    }

    public async Task<UploadSessionDto> GetUploadStatus(ISender sender, int sessionId)
    {
        var query = new GetUploadStatusQuery
        {
            SessionId = sessionId
        };

        var result = await sender.Send(query);
        return result;
    }

    public async Task<IResult> GetHlsStream(ISender sender, [FromRoute] string videoId, [FromRoute] string fileName, IWebHostEnvironment env)
    {
        if (!int.TryParse(videoId, out int parsedVideoId))
        {
            return Results.BadRequest("Invalid video request.");
        }

        var hasAccess = await sender.Send(new CheckMediaFileAccessQuery 
        { 
            VideoId = parsedVideoId 
        });

        if (!hasAccess) 
        {
            return Results.Forbid();
        }

        var rootPath = env.WebRootPath;
        if (string.IsNullOrEmpty(rootPath)) return Results.NotFound();

        var physicalPath = Path.Combine(rootPath, "hls", videoId, fileName);
        
        var fullPath = Path.GetFullPath(physicalPath);
        if (!fullPath.StartsWith(Path.Combine(rootPath, "hls"), StringComparison.OrdinalIgnoreCase))
        {
            return Results.Forbid();
        }

        if (!File.Exists(fullPath))
        {
            return Results.NotFound();
        }

        // Determine content type
        string contentType = fileName.EndsWith(".m3u8", StringComparison.OrdinalIgnoreCase) 
            ? "application/vnd.apple.mpegurl" 
            : (fileName.EndsWith(".ts", StringComparison.OrdinalIgnoreCase) ? "video/MP2T" : "application/octet-stream");

        return Results.File(fullPath, contentType);
    }
}
