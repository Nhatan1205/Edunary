using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.ValueObjects;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Services;

public class VideoProcessorService : IVideoProcessorService
{
    private readonly ILogger<VideoProcessorService> _logger;
    private readonly List<VideoVariant> _variants = new()
    {
        VideoVariant.From("480p", "854x480", "800k", "96k"),
        VideoVariant.From("720p", "1280x720", "1500k", "128k"),
        VideoVariant.From("1080p", "1920x1080", "3000k", "192k")
    };

    public VideoProcessorService(ILogger<VideoProcessorService> logger)
    {
        _logger = logger;
    }

    public async Task<int> ConvertToAdaptiveHlsAsync(string inputFilePath, string outputBaseDir, string thumbnailFilePath)
    {
        if (Directory.Exists(outputBaseDir))
        {
            Directory.Delete(outputBaseDir, true);
        }
        Directory.CreateDirectory(outputBaseDir);

        var masterPlaylistBuilder = new StringBuilder();

        foreach (var variant in _variants)
        {
            var variantDir = Path.Combine(outputBaseDir, variant.Name);
            Directory.CreateDirectory(variantDir);

            int exitCode = await ConvertToVariantHlsAsync(inputFilePath, variant, variantDir);

            if (exitCode != 0)
            {
                throw new Exception($"FFmpeg failed for {variant.Name}");
            }

            masterPlaylistBuilder.Append($"#EXT-X-STREAM-INF:BANDWIDTH={variant.GetBandwidthEstimate()},RESOLUTION={variant.Resolution}\n")
                                 .Append($"{variant.Name}/playlist.m3u8\n");
        }

        // Tạo master.m3u8
        var masterPlaylistPath = Path.Combine(outputBaseDir, "master.m3u8");
        var masterContent = $"#EXTM3U\n{masterPlaylistBuilder}";
        await File.WriteAllTextAsync(masterPlaylistPath, masterContent);

        try
        {
            await GenerateThumbnailAtHalfwayAsync(inputFilePath, thumbnailFilePath);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to generate thumbnail at halfway, falling back to 00:00:01");
            await TryGenerateThumbnailAtTimestampAsync(inputFilePath, thumbnailFilePath, "00:00:01");
        }
        
        return 0;
    }

    private async Task<int> ConvertToVariantHlsAsync(string inputFilePath, VideoVariant variant, string variantDir)
    {
        var playlistPath = Path.Combine(variantDir, "playlist.m3u8").Replace("\\", "/");
        var segmentPattern = Path.Combine(variantDir, "segment_%03d.ts").Replace("\\", "/");

        var arguments = $"-y -loglevel error -i \"{inputFilePath}\" -vf \"scale={variant.Resolution}\" " +
                        $"-c:v libx264 -b:v {variant.VideoBitrate} -c:a aac -b:a {variant.AudioBitrate} " +
                        $"-hls_time 4 -hls_list_size 0 -hls_segment_filename \"{segmentPattern}\" -f hls \"{playlistPath}\"";

        return await ExecuteProcessAsync("ffmpeg", arguments); 
    }

    public async Task GenerateThumbnailAtHalfwayAsync(string videoPath, string outputImagePath)
    {
        double duration = await GetVideoDurationInSecondsAsync(videoPath);
        double halfway = duration / 2;

        int hours = (int)(halfway / 3600);
        int minutes = (int)((halfway % 3600) / 60);
        int seconds = (int)(halfway % 60);

        string timestamp = $"{hours:D2}:{minutes:D2}:{seconds:D2}";

        int exitCode = await TryGenerateThumbnailAtTimestampAsync(videoPath, outputImagePath, timestamp);
        if (exitCode != 0)
        {
            throw new Exception($"Failed to generate thumbnail at halfway ({timestamp})");
        }
    }

    private async Task<int> TryGenerateThumbnailAtTimestampAsync(string input, string output, string timestamp)
    {
        // Must ensure output directory exists for the thumbnail
        var outputDir = Path.GetDirectoryName(output);
        if (!string.IsNullOrEmpty(outputDir) && !Directory.Exists(outputDir))
        {
            Directory.CreateDirectory(outputDir);
        }

        var arguments = $"-ss {timestamp} -i \"{input}\" -vframes 1 -f image2 -q:v 2 \"{output}\" -y";
        return await ExecuteProcessAsync("ffmpeg", arguments);
    }

    public async Task<double> GetVideoDurationInSecondsAsync(string videoPath)
    {
        var arguments = $"-v error -select_streams v:0 -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \"{videoPath}\"";
        
        var startInfo = new ProcessStartInfo
        {
            FileName = "ffprobe",
            Arguments = arguments,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = Process.Start(startInfo);
        if (process == null)
            throw new Exception("Failed to start ffprobe process");

        var outputTask = process.StandardOutput.ReadToEndAsync();
        var errorTask = process.StandardError.ReadToEndAsync();

        await Task.WhenAll(outputTask, errorTask, process.WaitForExitAsync());

        string output = await outputTask;
        string error = await errorTask;

        if (process.ExitCode != 0 || string.IsNullOrWhiteSpace(output))
        {
            throw new Exception($"Failed to get video duration. Error: {error}");
        }

        if (double.TryParse(output.Trim(), out double duration))
        {
            return duration;
        }
        
        throw new Exception("Could not parse duration output from ffprobe");
    }

    private async Task<int> ExecuteProcessAsync(string fileName, string arguments)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = arguments,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = new Process { StartInfo = startInfo };
        process.Start();

        var consumeOutput = process.StandardOutput.ReadToEndAsync();
        var consumeError = process.StandardError.ReadToEndAsync();

        await process.WaitForExitAsync();
        
        if (process.ExitCode != 0)
        {
            var error = await consumeError;
            _logger.LogError("FFmpeg Error: {Error}", error);
        }

        return process.ExitCode;
    }
}
