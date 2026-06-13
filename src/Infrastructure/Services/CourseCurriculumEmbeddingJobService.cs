using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Services;

public class CourseCurriculumEmbeddingJobService : ICourseCurriculumEmbeddingJobService
{
    private readonly IApplicationDbContext _context;
    private readonly IAICenterClient _aiCenterClient;
    private readonly ISender _sender;
    private readonly ILogger<CourseCurriculumEmbeddingJobService> _logger;

    public CourseCurriculumEmbeddingJobService(
        IApplicationDbContext context,
        IAICenterClient aiCenterClient,
        ISender sender,
        ILogger<CourseCurriculumEmbeddingJobService> logger)
    {
        _context = context;
        _aiCenterClient = aiCenterClient;
        _sender = sender;
        _logger = logger;
    }

    public void EnqueueCurriculumEmbedding(int courseId)
    {
        BackgroundJob.Enqueue<ICourseCurriculumEmbeddingJobService>(
            svc => svc.ProcessCurriculumEmbeddingAsync(courseId));
    }

    public void EnqueueCurriculumEmbeddingDeletion(int courseId)
    {
        BackgroundJob.Enqueue<ICourseCurriculumEmbeddingJobService>(
            svc => svc.ProcessCurriculumEmbeddingDeletionAsync(courseId));
    }

    public void EnqueueBatchCurriculumEmbedding()
    {
        BackgroundJob.Enqueue<ICourseCurriculumEmbeddingJobService>(
            svc => svc.ProcessBatchCurriculumEmbeddingAsync());
    }

    public async Task ProcessCurriculumEmbeddingAsync(int courseId)
    {
        _logger.LogInformation("Starting course curriculum embedding job for CourseId: {Id}", courseId);

        var course = await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Topics)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null)
        {
            _logger.LogWarning("Course {Id} not found — skipping curriculum embedding.", courseId);
            return;
        }

        if (course.Status != CourseStatus.Public)
        {
            _logger.LogInformation(
                "Course {Id} is not Public (Status={Status}) — enqueueing curriculum deletion instead.",
                courseId, course.Status);
            EnqueueCurriculumEmbeddingDeletion(courseId);
            return;
        }

        try
        {
            var aiConfig = await _sender.Send(new GetAIConfigQuery());
            var parsedContent = ParseCurriculum(course.Content);
            
            var mediaCaptionsMap = await FetchMediaCaptionsMapAsync(parsedContent);

            var lecturesPayload = new List<object>();
            var itemHistory = new List<string>();

            int sectionIndex = 0;
            foreach (var section in parsedContent)
            {
                if (section.Items == null)
                {
                    sectionIndex++;
                    continue;
                }

                int itemIndex = 0;
                foreach (var item in section.Items)
                {
                    var itemType = item.GetResolvedType();
                    if (itemType == "article" || itemType == "video" || itemType == "lecture")
                    {
                        string contentText = string.Empty;
                        bool hasCodeBlocks = false;
                        bool isVideo = itemType == "video" || (itemType == "lecture" && item.VideoId > 0);

                        if (isVideo)
                        {
                            if (item.VideoId > 0 && mediaCaptionsMap.TryGetValue(item.VideoId, out var mediaFile))
                            {
                                var caption = mediaFile.VideoCaptions?
                                    .FirstOrDefault(c => c.Status == CaptionStatus.COMPLETED);

                                if (caption != null && !string.IsNullOrWhiteSpace(caption.FileUrl))
                                {
                                    contentText = await DownloadAndParseVttAsync(caption.FileUrl);
                                }
                            }
                        }
                        else
                        {
                            contentText = StripHtml(item.Content ?? "");
                            if (!string.IsNullOrEmpty(item.Content))
                            {
                                hasCodeBlocks = item.Content.Contains("<pre>") || item.Content.Contains("<code>") || item.Content.Contains("```");
                            }
                        }

                        // Fallback: If contentText is empty or whitespace, use title + description so it's not skipped.
                        if (string.IsNullOrWhiteSpace(contentText))
                        {
                            contentText = $"Lecture: {item.Title}. {(string.IsNullOrWhiteSpace(item.Description) ? "" : "Description: " + item.Description)}";
                        }

                        var preceding = itemHistory.TakeLast(3).ToList();
                        
                        lecturesPayload.Add(new
                        {
                            section_id = section.SectionId ?? string.Empty,
                            section_index = sectionIndex,
                            section_title = section.Title ?? string.Empty,
                            section_learning_objectives = section.LearningObjectives ?? string.Empty,
                            item_id = item.ItemId ?? string.Empty,
                            item_index = itemIndex,
                            item_title = item.Title ?? string.Empty,
                            item_type = isVideo ? "video" : "article",
                            content_text = contentText,
                            word_count = EstimateWordCount(contentText),
                            has_code_blocks = hasCodeBlocks,
                            preceding_item_ids = preceding
                        });
                    }

                    if (!string.IsNullOrEmpty(item.ItemId))
                    {
                        itemHistory.Add(item.ItemId);
                    }
                    itemIndex++;
                }

                sectionIndex++;
            }

            if (!lecturesPayload.Any())
            {
                _logger.LogInformation("No lecture content found to embed for CourseId: {Id}", courseId);
                return;
            }

            var courseMetadata = new
            {
                course_title = course.Title ?? string.Empty,
                course_category = course.Category?.Title ?? string.Empty,
                course_topics = course.Topics?.Select(t => t.Name).ToList() ?? new List<string>(),
                updated_at = (course.LastModified != default ? course.LastModified : course.Created).ToString("o")
            };

            var payload = new
            {
                course_id = courseId,
                course_metadata = courseMetadata,
                lectures = lecturesPayload,
                embedding_config = BuildEmbeddingConfig(aiConfig),
                qdrant_config = BuildQdrantConfig(aiConfig, "edunary_curriculum")
            };

            var payloadJson = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });

            /*
            try
            {
                var debugDir = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "debug_payloads");
                if (!System.IO.Directory.Exists(debugDir))
                {
                    System.IO.Directory.CreateDirectory(debugDir);
                }
                var debugPath = System.IO.Path.Combine(debugDir, $"curriculum_payload_{courseId}.json");
                await System.IO.File.WriteAllTextAsync(debugPath, payloadJson);
                _logger.LogInformation("Saved curriculum debug payload to: {Path}", debugPath);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to save debug payload to file");
            }
            */

            var url = $"{aiConfig.AICenterBaseUrl}api/curriculum/embed";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, payloadJson);

            if (!isSuccess)
            {
                _logger.LogError("AI Center curriculum embed failed for course {Id}: {Body}", courseId, body);
            }
            else
            {
                _logger.LogInformation(
                    "Course curriculum {Id} ('{Title}') embedded successfully.", courseId, course.Title);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Course curriculum embedding job failed for CourseId: {Id}", courseId);
        }
    }

    public async Task ProcessCurriculumEmbeddingDeletionAsync(int courseId)
    {
        _logger.LogInformation("Starting course curriculum embedding deletion job for CourseId: {Id}", courseId);

        try
        {
            var aiConfig = await _sender.Send(new GetAIConfigQuery());

            var payload = new
            {
                course_id = courseId,
                qdrant_config = BuildQdrantConfig(aiConfig, "edunary_curriculum")
            };

            var url = $"{aiConfig.AICenterBaseUrl}api/curriculum/delete";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload));

            if (!isSuccess)
            {
                _logger.LogWarning(
                    "AI Center delete curriculum returned failure for course {Id}: {Body}", courseId, body);
            }
            else
            {
                _logger.LogInformation(
                    "Curriculum embedding deleted for course {Id}.", courseId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Course curriculum embedding deletion job failed for CourseId: {Id}", courseId);
        }
    }

    public async Task ProcessBatchCurriculumEmbeddingAsync()
    {
        _logger.LogInformation("Starting batch curriculum embedding job (all Public courses)...");

        try
        {
            var courses = await _context.Courses
                .Where(c => c.Status == CourseStatus.Public)
                .Select(c => c.Id)
                .ToListAsync();

            if (!courses.Any())
            {
                _logger.LogWarning("No Public courses found for batch curriculum embedding.");
                return;
            }

            _logger.LogInformation("Found {Count} Public courses to batch curriculum embed.", courses.Count);

            foreach (var courseId in courses)
            {
                EnqueueCurriculumEmbedding(courseId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Batch curriculum embedding job failed.");
        }
    }

    // Private helpers

    private static object BuildEmbeddingConfig(AIConfigDto aiConfig)
    {
        return new
        {
            provider = aiConfig.EmbeddingProvider,
            model_name = aiConfig.EmbeddingModelName,
            api_key = aiConfig.EmbeddingApiKey,
            base_url = aiConfig.EmbeddingBaseUrl
        };
    }

    private static object BuildQdrantConfig(AIConfigDto aiConfig, string collectionOverride)
    {
        return new
        {
            url = aiConfig.QdrantUrl,
            api_key = aiConfig.QdrantApiKey,
            collection = collectionOverride
        };
    }

    private List<SectionContentJson> ParseCurriculum(string contentJson)
    {
        if (string.IsNullOrWhiteSpace(contentJson))
        {
            return new List<SectionContentJson>();
        }
        try
        {
            var parsed = JsonSerializer.Deserialize<CourseContentJson>(contentJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return parsed?.Contents ?? new List<SectionContentJson>();
        }
        catch
        {
            return new List<SectionContentJson>();
        }
    }

    private static string StripHtml(string html)
    {
        if (string.IsNullOrWhiteSpace(html))
        {
            return "";
        }
        return Regex.Replace(html, @"<[^>]+>", " ")
            .Replace("&nbsp;", " ")
            .Replace("&amp;", "&")
            .Replace("&lt;", "<")
            .Replace("&gt;", ">")
            .Replace("&quot;", "\"")
            .Replace("&#39;", "'");
    }

    private static int EstimateWordCount(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return 0;
        return text.Split((char[])null, StringSplitOptions.RemoveEmptyEntries).Length;
    }

    private async Task<string> DownloadAndParseVttAsync(string fileUrl)
    {
        using var client = new HttpClient();
        try
        {
            var vttContent = await client.GetStringAsync(fileUrl);
            return ParseVtt(vttContent);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed to download VTT from {Url}: {Error}", fileUrl, ex.Message);
            return string.Empty;
        }
    }

    private static string ParseVtt(string vtt)
    {
        var lines = vtt.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        var textLines = new List<string>();
        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (trimmed == "WEBVTT" || trimmed.Contains("-->") || string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("NOTE"))
                continue;

            var cleanLine = Regex.Replace(trimmed, @"<[^>]+>", "");
            if (!string.IsNullOrWhiteSpace(cleanLine))
            {
                textLines.Add(cleanLine);
            }
        }
        return string.Join(" ", textLines);
    }

    private async Task<Dictionary<int, MediaFile>> FetchMediaCaptionsMapAsync(List<SectionContentJson> parsedContent)
    {
        var mediaIds = parsedContent
            .SelectMany(s => s.Items ?? new List<ItemContentJson>())
            .Where(i => (i.GetResolvedType() == "video" || i.GetResolvedType() == "lecture") && i.VideoId > 0)
            .Select(i => i.VideoId)
            .Distinct()
            .ToList();

        var mediaCaptions = await _context.MediaFiles
            .Include(m => m.VideoCaptions)
            .Where(m => mediaIds.Contains(m.Id))
            .AsNoTracking()
            .ToListAsync();

        return mediaCaptions.ToDictionary(m => m.Id);
    }

    //Internal JSON Mapping Classes

    private class CourseContentJson
    {
        public List<SectionContentJson> Contents { get; set; }
    }

    private class SectionContentJson
    {
        public string SectionId { get; set; }
        public string Title { get; set; }
        public string LearningObjectives { get; set; }
        public List<ItemContentJson> Items { get; set; }
    }

    private class ItemContentJson
    {
        public string ItemId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ContentType { get; set; }
        public string Type { get; set; }
        public string Content { get; set; }
        public int VideoId { get; set; }

        public string GetResolvedType()
        {
            return (!string.IsNullOrWhiteSpace(ContentType) ? ContentType : Type)?.ToLowerInvariant() ?? "";
        }
    }
}
