using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Diagnostics;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.MediaFiles.Queries.GetMediaFileByUserIdQuery;
using Edunary.Domain.Common;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using TagLib;

namespace Edunary.Infrastructure.Services;

public class ChunkedUploadService : IChunkedUploadService
{
    private readonly ApplicationDbContext _context;
    private readonly AppSettings _appSettings;
    private readonly ICurrentUserService _currentUserService;

    public ChunkedUploadService(
        ApplicationDbContext context,
        IOptions<AppSettings> appSettings,
        ICurrentUserService currentUserService
    )
    {
        _context = context;
        _appSettings = appSettings.Value;
        _currentUserService = currentUserService;
    }

    public async Task<UploadSessionDto> InitiateUpload(InitiateUploadRequest request)
    {
        var userId = _currentUserService?.UserId;
        // 1. check existed session
        if (string.IsNullOrEmpty(request.FileHash) == false)
        {
            var existedSesssion = _context.MediaFiles.FirstOrDefault(cc => 
                cc.UserId == userId 
                && cc.FileHash == request.FileHash 
                && cc.Status == UploadStatus.IN_PROGRESS);
            if (existedSesssion != null)
            {
                return new UploadSessionDto
                {
                    SessionId = existedSesssion.Id.ToString(),
                    FileName = existedSesssion.FileName,
                    FileSize = existedSesssion.FileSize,
                    ChunkSize = existedSesssion.ChunkSize,
                    TotalChunks = existedSesssion.TotalChunks,
                    UploadedChunks = existedSesssion.UploadedChunks,
                    Status = existedSesssion.Status,
                    CourseId = existedSesssion.CourseId,
                    FileUrl = existedSesssion.FileUrl,
                    ContentType = existedSesssion.ContentType,
                    Duration = existedSesssion.Status == UploadStatus.COMPLETED ? await GetVideoDuration(existedSesssion.FileUrl) : null
                };
            }  
        }
        // 2. else create new session
        var newSession = new MediaFile
        {
            FileName = request.FileName,
            FileSize = request.FileSize,
            FileHash = request.FileHash,
            Status = UploadStatus.IN_PROGRESS,
            ContentType = request.ContentType,
            UploadedChunks = 0,
            ChunkSize = request.ChunkSize,
            TotalChunks = (int)Math.Ceiling((double)request.FileSize / request.ChunkSize),
            UserId = userId,
            FileUrl = "",
            CourseId = request.CourseId
        };
        _context.MediaFiles.Add(newSession);
        await _context.SaveChangesAsync();
        // 3. create temporary filepath
        
        try
        {
            var tempFolder = Path.Combine(
                Environment.CurrentDirectory,
                "wwwroot",
                "temp",
                "uploads",
                userId,
                newSession.Id.ToString()
            );
            var uniqueFileName = $"{newSession.Id}-{newSession.FileName}";

            if (!Directory.Exists(tempFolder))
            {
                Directory.CreateDirectory(tempFolder);
            }
            
            var filePath = Path.Combine(tempFolder, uniqueFileName);
            newSession.FileUrl = filePath;
            await _context.SaveChangesAsync();

            // pre-allocate file with the exact size needed
            using (var fs = new FileStream(filePath, FileMode.Create, FileAccess.Write))
            {
                fs.SetLength(request.FileSize);
            }
        }
        catch (IOException ex)
        {
            throw new Exception("Cant create temp folder or pre-allocate file: " + ex.Message);
        }
        return new UploadSessionDto
        {
            SessionId = newSession.Id.ToString(),
            FileName = newSession.FileName,
            FileSize = newSession.FileSize,
            ChunkSize = newSession.ChunkSize,
            TotalChunks = newSession.TotalChunks,
            UploadedChunks = newSession.UploadedChunks,
            Status = newSession.Status,
            ExpiresAt = newSession.Created.AddDays(1).DateTime,
            ProgressPercentage = newSession.TotalChunks > 0 ? (double)newSession.UploadedChunks / newSession.TotalChunks * 100 : 0,
            CourseId = newSession.CourseId,
            FileUrl = newSession.FileUrl,
            ContentType = newSession.ContentType,
            Duration = null // Duration only available after all chunks uploaded
        };
    }

    public async Task<UploadSessionDto> UploadChunk(Stream chunkStream, ChunkUploadRequest request)
    {
        var userId = _currentUserService?.UserId;
        
        // 1. Validate session exists
        var uploadSession = _context.MediaFiles
            .FirstOrDefault(cc => cc.Id.ToString() == request.SessionId);
        
        if (uploadSession == null)
            throw new Exception($"Upload session not found with ID: {request.SessionId}");
        
        // 2. Check permission
        if (uploadSession.UserId != userId)
            throw new Exception("You don't have permission to access this upload session");
        
        // 3. Check status
        if (uploadSession.Status == UploadStatus.COMPLETED)
            throw new Exception("Upload session already completed");
        
        // 4. Check expiration (24 hours from creation)
        if (uploadSession.Created.AddDays(1) < DateTime.UtcNow)
        {
            uploadSession.Status = UploadStatus.EXPIRED;
            _context.MediaFiles.Update(uploadSession);
            await _context.SaveChangesAsync(CancellationToken.None);
            throw new Exception("Upload session has expired");
        }
        
        // 5. Validate chunk number is valid
        if (request.ChunkNumber < 0 || request.ChunkNumber >= uploadSession.TotalChunks)
            throw new Exception($"Invalid chunk number: {request.ChunkNumber}");
        
        // 6. Check stream is not null
        if (chunkStream == null || chunkStream.Length == 0)
            throw new Exception("Chunk stream cannot be null or empty");
        
        // 7. Write chunk to temp file
        try
        {
            var filePath = uploadSession.FileUrl;
            using (var fs = new FileStream(filePath, FileMode.Open, FileAccess.Write))
            {
                // Calculate byte position for this chunk
                long offset = (long)request.ChunkNumber * uploadSession.ChunkSize;
                fs.Seek(offset, SeekOrigin.Begin);
                await chunkStream.CopyToAsync(fs);
            }
        }
        catch (IOException ex)
        {
            throw new Exception($"Failed to write chunk to temporary file: {ex.Message}");
        }
        
        // 8. Update session
        bool isLastChunk = request.ChunkNumber == uploadSession.TotalChunks - 1;
        uploadSession.UploadedChunks += 1;
        
        if (isLastChunk)
        {
            uploadSession.Status = UploadStatus.COMPLETED;
            
            // 9. Check hash match if provided
            if (!string.IsNullOrEmpty(uploadSession.FileHash))
            {
                bool hashMatch = await CheckHashMatch(uploadSession.FileUrl, uploadSession.FileHash);
                if (!hashMatch)
                    throw new Exception("File hash does not match");
            }
        }
        else
        {
            uploadSession.Status = UploadStatus.IN_PROGRESS;
        }
        
        _context.MediaFiles.Update(uploadSession);
        await _context.SaveChangesAsync(CancellationToken.None);
        
        // If this is the last chunk, try to extract video duration
        string duration = null;
        if (isLastChunk)
        {
            duration = await GetVideoDuration(uploadSession.FileUrl);
        }
        
        return new UploadSessionDto
        {
            SessionId = uploadSession.Id.ToString(),
            FileName = uploadSession.FileName,
            FileSize = uploadSession.FileSize,
            ChunkSize = uploadSession.ChunkSize,
            TotalChunks = uploadSession.TotalChunks,
            UploadedChunks = uploadSession.UploadedChunks,
            Status = uploadSession.Status,
            ExpiresAt = uploadSession.Created.AddDays(1).DateTime,
            ProgressPercentage = uploadSession.TotalChunks > 0 ? (double)uploadSession.UploadedChunks / uploadSession.TotalChunks * 100 : 0,
            CourseId = uploadSession.CourseId,
            FileUrl = uploadSession.FileUrl,
            ContentType = uploadSession.ContentType,
            Duration = duration
        };
    }

    /// <summary>
    /// Check if uploaded file hash matches expected hash
    /// </summary>
    private async Task<bool> CheckHashMatch(string tempFilePath, string expectedHash)
    {
        try
        {
            using (var fs = System.IO.File.Open(tempFilePath, FileMode.Open))
            {
                var hash = await ComputeSHA256Async(fs);
                return hash.Equals(expectedHash, StringComparison.OrdinalIgnoreCase);
            }
        }
        catch (IOException ex)
        {
            throw new Exception($"Failed to read temporary file for hash verification: {ex.Message}");
        }
    }

    /// <summary>
    /// Compute SHA256 hash of a stream
    /// </summary>
    private async Task<string> ComputeSHA256Async(Stream stream)
    {
        using (var sha256 = SHA256.Create())
        {
            var hash = await Task.Run(() => sha256.ComputeHash(stream));
            return Convert.ToBase64String(hash);
        }
    }

    /// <summary>
    /// Extract video duration using ffprobe
    /// </summary>
    private async Task<string> GetVideoDuration(string filePath)
    {
        try
        {
            return await Task.Run(() =>
            {
                using (var tfile = TagLib.File.Create(filePath))
                {
                    TimeSpan duration = tfile.Properties.Duration;
                    return $"{(int)duration.TotalHours:D2}:{duration.Minutes:D2}:{duration.Seconds:D2}";
                }
            });
        }
        catch (Exception ex)
        {
            // Log but don't fail - duration extraction is optional
            System.Diagnostics.Debug.WriteLine($"Failed to extract video duration: {ex.Message}");
            return null;
        }
    }


    public async Task<UploadSessionDto> GetUploadStatus(string sessionId)
    {
        var uploadSession = await _context.MediaFiles
        .FirstOrDefaultAsync(cc => cc.Id.ToString() == sessionId);
    
        if (uploadSession == null)
            throw new Exception($"Upload session not found with ID: {sessionId}");
        
        if (uploadSession.UserId != null && uploadSession.UserId != _currentUserService?.UserId)
            throw new Exception("You don't have permission to access this upload session");
        
        return new UploadSessionDto
        {
            SessionId = uploadSession.Id.ToString(),
            FileName = uploadSession.FileName,
            FileSize = uploadSession.FileSize,
            ChunkSize = uploadSession.ChunkSize,
            TotalChunks = uploadSession.TotalChunks,
            UploadedChunks = uploadSession.UploadedChunks,
            Status = uploadSession.Status,
            ExpiresAt = uploadSession.Created.AddDays(1).DateTime,
            ProgressPercentage = uploadSession.TotalChunks > 0 ? (double)uploadSession.UploadedChunks / uploadSession.TotalChunks * 100 : 0,
            CourseId = uploadSession.CourseId,
            FileUrl = uploadSession.FileUrl,
            ContentType = uploadSession.ContentType,
            Duration = uploadSession.Status == UploadStatus.COMPLETED ? await GetVideoDuration(uploadSession.FileUrl) : null
        };
    }

}
