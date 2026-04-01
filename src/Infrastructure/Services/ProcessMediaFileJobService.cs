using System;
using System.IO;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Edunary.Infrastructure.Hubs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Hangfire;

namespace Edunary.Infrastructure.Services;

public class ProcessMediaFileJobService : IProcessMediaFileJobService
{
    private readonly IApplicationDbContext _context;
    private readonly IVideoProcessorService _videoProcessorService;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<ProcessMediaFileJobService> _logger;
    private readonly INotifyService _notifyService;

    public ProcessMediaFileJobService(
        IApplicationDbContext context,
        IVideoProcessorService videoProcessorService,
        IWebHostEnvironment env,
        ILogger<ProcessMediaFileJobService> logger,
        INotifyService notifyService)
    {
        _context = context;
        _videoProcessorService = videoProcessorService;
        _env = env;
        _logger = logger;
        _notifyService = notifyService;
    }

    public void EnqueueVideoProcessing(int mediaFileId)
    {
        BackgroundJob.Enqueue<IProcessMediaFileJobService>(service => service.ProcessVideoToHlsAsync(mediaFileId));
    }

    public async Task ProcessVideoToHlsAsync(int mediaFileId)
    {
        _logger.LogInformation("Starting HLS Transcoding job for MediaFile ID: {Id}", mediaFileId);

        var mediaFile = await _context.MediaFiles.FirstOrDefaultAsync(m => m.Id == mediaFileId);
        if (mediaFile == null)
        {
            _logger.LogError("MediaFile with ID {Id} not found in database.", mediaFileId);
            return;
        }

        if (mediaFile.Status != UploadStatus.COMPLETED)
        {
            _logger.LogWarning("MediaFile {Id} upload is not fully completed yet.", mediaFileId);
            return;
        }

        // Send UI Notification that processing started
        await NotifyUserAsync(mediaFile.UserId, $"Video {mediaFile.FileName} is now being processed...", mediaFileId, "PROCESSING");

        // Prepare paths
        string inputMp4Path = Path.Combine(_env.ContentRootPath, mediaFile.FileUrl.TrimStart('/')); // Assuming FileUrl is somewhat relative like "wwwroot/temp/uploads/..."
        
        if (!File.Exists(inputMp4Path))
        {
            _logger.LogError("Input MP4 file not found at path: {Path}", inputMp4Path);
            mediaFile.HlsStatus = VideoStatus.ERROR;
            await _context.SaveChangesAsync(default);
            await NotifyUserAsync(mediaFile.UserId, $"Failed to process video {mediaFile.FileName}: File missing.", mediaFileId, "FAILED");
            return;
        }

        // Ensure we store HLS outputs in wwwroot/hls/{mediaFileId}/
        // Path mapped so front-end can reach it via /hls/{mediaFileId}/master.m3u8
        string relativeHlsDir = $"hls/{mediaFile.Id}";
        string outputBaseDir = Path.Combine(_env.WebRootPath, relativeHlsDir);
        string thumbnailRelativePath = $"{relativeHlsDir}/thumbnail.jpg";
        string thumbnailOutputFile = Path.Combine(_env.WebRootPath, thumbnailRelativePath);

        try
        {
            // Execute transcoding!
            int exitCode = await _videoProcessorService.ConvertToAdaptiveHlsAsync(
                inputMp4Path, 
                outputBaseDir, 
                thumbnailOutputFile
            );

            if (exitCode != 0)
            {
                throw new Exception("VideoProcessorService transcode failed with non-zero exit code.");
            }

            // Get Duration
            double durationSeconds = await _videoProcessorService.GetVideoDurationInSecondsAsync(inputMp4Path);
            int hrs = (int)(durationSeconds / 3600);
            int mins = (int)((durationSeconds % 3600) / 60);
            int secs = (int)(durationSeconds % 60);
            
            // Update entity
            mediaFile.Duration = $"{hrs:D2}:{mins:D2}:{secs:D2}";
            mediaFile.ThumbnailUrl = $"/{thumbnailRelativePath}";
            mediaFile.HlsPath = $"/{relativeHlsDir}/master.m3u8";
            mediaFile.HlsStatus = VideoStatus.READY;

            await _context.SaveChangesAsync(default);

            // Clean up old mp4 to save disk space
            try 
            {
                File.Delete(inputMp4Path);
                _logger.LogInformation("Deleted original MP4 file: {Path}", inputMp4Path);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete original MP4 file: {Path}", inputMp4Path);
            }

            // Send Realtime signal of completion
            await NotifyUserAsync(mediaFile.UserId, $"Video {mediaFile.FileName} is ready for playback!", mediaFileId, "COMPLETED");
            _logger.LogInformation("Successfully completed HLS Transcoding for MediaFile ID: {Id}", mediaFileId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate HLS for MediaFile {Id}", mediaFileId);
            
            mediaFile.HlsStatus = VideoStatus.ERROR;
            await _context.SaveChangesAsync(default);

            // Notify UI
            await NotifyUserAsync(mediaFile.UserId, $"Video {mediaFile.FileName} failed to process.", mediaFileId, "FAILED");
        }
    }

    private async Task NotifyUserAsync(string userId, string message, int mediaFileId, string state)
    {
        string title = state switch
        {
            "PROCESSING" => "Video Processing Started",
            "COMPLETED" => "Video Processing Completed",
            "FAILED" => "Video Processing Failed",
            _ => "Video Processing"
        };

        try
        {
            var payload = new 
            {
                Title = title,
                Body = message,
                MediaFileId = mediaFileId,
                State = state,
                Date = DateTime.UtcNow
            };

            await _notifyService.NotifyUserAsync(
                userId: userId,
                title: title,
                message: message,
                type: "system",
                payload: payload
            );
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not send combined notification to User ID {UserId}", userId);
        }
    }
}
