using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Edunary.Domain.Enums;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Services;

public class CourseEmbeddingJobService : ICourseEmbeddingJobService
{
    private readonly IApplicationDbContext _context;
    private readonly IAICenterClient _aiCenterClient;
    private readonly IIdentityService _identityService;
    private readonly ISender _sender;
    private readonly INotifyService _notifyService;
    private readonly ILogger<CourseEmbeddingJobService> _logger;

    public CourseEmbeddingJobService(
        IApplicationDbContext context,
        IAICenterClient aiCenterClient,
        IIdentityService identityService,
        ISender sender,
        INotifyService notifyService,
        ILogger<CourseEmbeddingJobService> logger)
    {
        _context = context;
        _aiCenterClient = aiCenterClient;
        _identityService = identityService;
        _sender = sender;
        _notifyService = notifyService;
        _logger = logger;
    }


    public void EnqueueCourseEmbedding(int courseId)
    {
        BackgroundJob.Enqueue<ICourseEmbeddingJobService>(
            svc => svc.ProcessCourseEmbeddingAsync(courseId));
    }

    public void EnqueueCourseEmbeddingDeletion(int courseId)
    {
        BackgroundJob.Enqueue<ICourseEmbeddingJobService>(
            svc => svc.ProcessCourseEmbeddingDeletionAsync(courseId));
    }

    public void EnqueueBatchCourseEmbedding(string userId)
    {
        BackgroundJob.Enqueue<ICourseEmbeddingJobService>(
            svc => svc.ProcessBatchCourseEmbeddingAsync(userId));
    }


    public async Task ProcessCourseEmbeddingAsync(int courseId)
    {
        _logger.LogInformation("Starting course embedding job for CourseId: {Id}", courseId);

        var course = await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Topics)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null)
        {
            _logger.LogWarning("Course {Id} not found — skipping embedding.", courseId);
            return;
        }

        // Only embed Public courses; if Draft, delete any stale embedding
        if (course.Status != CourseStatus.Public)
        {
            _logger.LogInformation(
                "Course {Id} is not Public (Status={Status}) — enqueueing deletion instead.",
                courseId, course.Status);
            EnqueueCourseEmbeddingDeletion(courseId);
            return;
        }

        try
        {
            var aiConfig = await _sender.Send(new GetAIConfigQuery());
            var instructorName = await _identityService.GetFullNameAsync(course.CreatedBy ?? "");

            var coursePayload = BuildCoursePayload(course, instructorName);

            var payload = new
            {
                course = coursePayload,
                embedding_config = BuildEmbeddingConfig(aiConfig),
                qdrant_config = BuildQdrantConfig(aiConfig, "edunary_courses"),
            };

            var url = $"{aiConfig.AICenterBaseUrl}api/course-embeddings/embed";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload));

            if (!isSuccess)
            {
                _logger.LogError("AI Center embed failed for course {Id}: {Body}", courseId, body);
            }
            else
            {
                _logger.LogInformation(
                    "Course {Id} ('{Title}') embedded successfully.", courseId, course.Title);

                if (!string.IsNullOrEmpty(course.CreatedBy))
                {
                    await _notifyService.NotifyUserAsync(
                        course.CreatedBy,
                        "Course Embedding Completed",
                        $"Your course '{course.Title}' has been successfully embedded and is now searchable.",
                        "System",
                        null);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Course embedding job failed for CourseId: {Id}", courseId);
        }
    }

    public async Task ProcessCourseEmbeddingDeletionAsync(int courseId)
    {
        _logger.LogInformation("Starting course embedding deletion job for CourseId: {Id}", courseId);

        try
        {
            var aiConfig = await _sender.Send(new GetAIConfigQuery());

            var payload = new
            {
                course_id = courseId,
                qdrant_config = BuildQdrantConfig(aiConfig, "edunary_courses"),
            };

            var url = $"{aiConfig.AICenterBaseUrl}api/course-embeddings/delete";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload));

            if (!isSuccess)
            {
                _logger.LogWarning(
                    "AI Center delete returned failure for course {Id}: {Body}", courseId, body);
            }
            else
            {
                _logger.LogInformation(
                    "Embedding deleted for course {Id}.", courseId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Course embedding deletion job failed for CourseId: {Id}", courseId);
        }
    }

    public async Task ProcessBatchCourseEmbeddingAsync(string userId)
    {
        _logger.LogInformation("Starting batch course embedding job (all Public courses)...");

        try
        {
            var aiConfig = await _sender.Send(new GetAIConfigQuery());

            // Fetch all Public courses with related data
            var courses = await _context.Courses
                .Include(c => c.Category)
                .Include(c => c.Topics)
                .Where(c => c.Status == CourseStatus.Public)
                .ToListAsync();

            if (!courses.Any())
            {
                _logger.LogWarning("No Public courses found for batch embedding.");
                return;
            }

            _logger.LogInformation("Found {Count} Public courses to batch embed.", courses.Count);

            // Resolve instructor names in bulk (1 DB call for all user IDs)
            var instructorIds = courses
                .Where(c => !string.IsNullOrEmpty(c.CreatedBy))
                .Select(c => c.CreatedBy!)
                .Distinct()
                .ToList();

            var instructors = await _identityService.GetUserIdentitiesByIdsAsync(
                instructorIds, CancellationToken.None);

            var instructorMap = instructors.ToDictionary(u => u.Id, u => u.FullName ?? "");

            // Build batch payload
            var coursePayloads = courses.Select(c =>
            {
                var instructorName = c.CreatedBy != null && instructorMap.TryGetValue(c.CreatedBy, out var name)
                    ? name
                    : "";
                return BuildCoursePayload(c, instructorName);
            }).ToList();

            var payload = new
            {
                courses = coursePayloads,
                embedding_config = BuildEmbeddingConfig(aiConfig),
                qdrant_config = BuildQdrantConfig(aiConfig, "edunary_courses"),
            };

            var url = $"{aiConfig.AICenterBaseUrl}api/course-embeddings/embed-batch";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload));

            if (!isSuccess)
            {
                _logger.LogError("AI Center batch embed failed: {Body}", body);

                if (!string.IsNullOrEmpty(userId))
                {
                    await _notifyService.NotifyUserAsync(
                        userId,
                        "Batch Embedding Failed",
                        "The batch course embedding job has failed. Please check the Hangfire dashboard for details.",
                        "System",
                        null);
                }

                return;
            }

            // Parse response for logging
            try
            {
                var response = JsonSerializer.Deserialize<JsonElement>(body);
                var totalEmbedded = response.TryGetProperty("total_embedded", out var tp)
                    ? tp.GetInt32() : courses.Count;
                _logger.LogInformation(
                    "Batch embedding completed: {Embedded}/{Total} courses embedded.",
                    totalEmbedded, courses.Count);
            }
            catch
            {
                _logger.LogInformation("Batch embedding completed for {Count} courses.", courses.Count);
            }

            if (!string.IsNullOrEmpty(userId))
            {
                await _notifyService.NotifyUserAsync(
                    userId,
                    "Batch Embedding Completed",
                    $"Batch course embedding has completed. {courses.Count} course(s) were processed.",
                    "System",
                    null);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Batch course embedding job failed.");

            if (!string.IsNullOrEmpty(userId))
            {
                await _notifyService.NotifyUserAsync(
                    userId,
                    "Batch Embedding Failed",
                    "The batch course embedding job has encountered an error. Please check the Hangfire dashboard for details.",
                    "System",
                    null);
            }
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private static object BuildCoursePayload(Domain.Entities.Course course, string instructorName)
    {
        return new
        {
            course_id = course.Id,
            title = course.Title,
            subtitle = course.Subtitle,
            description = course.Description,
            learning_objectives = course.LearningObjectives,
            requirements = course.Requirements,
            target_audience = course.TargetAudience,
            category_name = course.Category?.Title,
            topics = course.Topics.Select(t => t.Name).ToList(),
            level = course.Level.ToString(),
            price = course.Price,
            image_url = course.ImageUrl,
            instructor_name = instructorName,
        };
    }

    private static object BuildEmbeddingConfig(AIConfigDto aiConfig)
    {
        return new
        {
            provider = aiConfig.EmbeddingProvider,
            model_name = aiConfig.EmbeddingModelName,
            api_key = aiConfig.EmbeddingApiKey,
            base_url = aiConfig.EmbeddingBaseUrl,
        };
    }

    private static object BuildQdrantConfig(AIConfigDto aiConfig, string collectionOverride)
    {
        return new
        {
            url = aiConfig.QdrantUrl,
            api_key = aiConfig.QdrantApiKey,
            collection = collectionOverride,
        };
    }


}
