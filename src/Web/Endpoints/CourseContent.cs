using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.CourseContents.Commands.AddLinkToCCCommand;
using Edunary.Application.CourseContents.Commands.CreateCourseContentCommand;
using Edunary.Application.CourseContents.Commands.DeleteCourseContentCommand;
using Edunary.Application.CourseContents.Commands.GenerateUploadUrl;
using Edunary.Application.CourseContents.Commands.SetCourseIdForContentCommand;
using Edunary.Application.CourseContents.Queries.GetCourseContentByUserIdQuery;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class CourseContent : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetCourseContentsByUserId)
            .MapDelete(DeleteCourseContentById)
            .MapPost(CheckContentExists, "/exists")
            .MapPost(SetCourseIdForContent, "/set-course-id")
            .MapPost(AddLinkToCourseContent, "/add-link")
            .MapPost(GenerateUploadUrl, "/generate-upload-url");

        app.MapGroup(this)
            .RequireAuthorization()
            .DisableAntiforgery()
            .MapPost(CreateCourseContent);
            
    }

    public async Task<List<CourseContentDto>> GetCourseContentsByUserId(ISender sender)
    {
        var query = new GetCourseContentByUserId();
        var result = await sender.Send(query);
        return result;
    }

    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = 524288000, ValueLengthLimit = int.MaxValue)]
    public async Task<ReturnResult<CourseContentDto>> CreateCourseContent(ISender sender, [FromForm] IFormFile file, [FromForm] bool isOverride = false, [FromForm] int? courseId = null)
    {
        if (file == null || file.Length == 0)
        {
            var errorResult = new ReturnResult<CourseContentDto>
            {
                Message = "File not found."
            };
            return errorResult;
        }
        using var stream = file.OpenReadStream();
        var command = new CreateCourseContentCommand
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

    public async Task<IResult> DeleteCourseContentById(ISender sender, int id)
    {
        var command = new DeleteCourseContentCommand
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

    public async Task<bool> CheckContentExists(ISender sender, string fileName)
    {
        var query = new GetCourseContentByUserId();
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
    
    public async Task<ReturnResult<CourseContentDto>> AddLinkToCourseContent(ISender sender, AddLinkToCCCommand command)
    {
        var result = await sender.Send(command);
        return result;
    }

    public async Task<ReturnResult<GenerateUploadUrlDto>> GenerateUploadUrl(ISender sender, GenerateUploadUrlCommand command)
    {
        var result = await sender.Send(command);
        return result;
    }
}
