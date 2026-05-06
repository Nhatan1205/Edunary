using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Services;

public class UserEmbeddingJobService : IUserEmbeddingJobService
{
    private readonly IApplicationDbContext _context;
    private readonly IAICenterClient _aiCenterClient;
    private readonly IIdentityService _identityService;
    private readonly ISender _sender;
    private readonly INotifyService _notifyService;
    private readonly ILogger<UserEmbeddingJobService> _logger;

    public UserEmbeddingJobService(
        IApplicationDbContext context,
        IAICenterClient aiCenterClient,
        IIdentityService identityService,
        ISender sender,
        INotifyService notifyService,
        ILogger<UserEmbeddingJobService> logger)
    {
        _context = context;
        _aiCenterClient = aiCenterClient;
        _identityService = identityService;
        _sender = sender;
        _notifyService = notifyService;
        _logger = logger;
    }

    public void EnqueueUserProfileEmbedding(string userId)
    {
        BackgroundJob.Enqueue<IUserEmbeddingJobService>(
            svc => svc.ProcessUserProfileEmbeddingAsync(userId));
    }

    public void EnqueueBatchUserProfileEmbedding()
    {
        BackgroundJob.Enqueue<IUserEmbeddingJobService>(
            svc => svc.ProcessBatchUserProfileEmbeddingAsync());
    }

    public async Task ProcessUserProfileEmbeddingAsync(string userId)
    {
        _logger.LogInformation("Starting user profile embedding job for UserId: {Id}", userId);

        try
        {
            var aiConfig = await _sender.Send(new GetAIConfigQuery());

            // Load learner profile (may be null if user hasn't set one yet)
            var profile = await _context.LearnerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.StudentId == userId);

            // Load user identity info
            var userIdentity = await _identityService.GetUserIdentityByIdAsync(userId);
            if (userIdentity == null)
            {
                _logger.LogWarning("User {Id} not found in identity store — skipping embedding.", userId);
                return;
            }

            // Resolve category names
            List<string> categoryNames = [];
            if (profile != null && !string.IsNullOrEmpty(profile.PreferredCategoryIds))
            {
                var categoryIds = JsonSerializer.Deserialize<List<int>>(profile.PreferredCategoryIds) ?? [];
                if (categoryIds.Count > 0)
                {
                    categoryNames = await _context.Categories
                        .Where(c => categoryIds.Contains(c.Id))
                        .Select(c => c.Title)
                        .ToListAsync();
                }
            }

            // Resolve topic names
            List<string> topicNames = [];
            if (profile != null && !string.IsNullOrEmpty(profile.PreferredTopicIds))
            {
                var topicIds = JsonSerializer.Deserialize<List<int>>(profile.PreferredTopicIds) ?? [];
                if (topicIds.Count > 0)
                {
                    topicNames = await _context.Topics
                        .Where(t => topicIds.Contains(t.Id))
                        .Select(t => t.Name)
                        .ToListAsync();
                }
            }

            var userPayload = BuildUserPayload(userId, userIdentity.Email, userIdentity.FullName, profile, categoryNames, topicNames);

            var payload = new
            {
                user_profile = userPayload,
                embedding_config = BuildEmbeddingConfig(aiConfig),
                qdrant_config = BuildQdrantConfig(aiConfig, "edunary_users"),
            };

            var url = $"{aiConfig.AICenterBaseUrl}api/user-embeddings/embed";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload));

            if (!isSuccess)
            {
                _logger.LogError("AI Center embed failed for user {Id}: {Body}", userId, body);
            }
            else
            {
                _logger.LogInformation(
                    "User {Id} ('{Name}') embedded successfully.", userId, userIdentity.FullName);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "User profile embedding job failed for UserId: {Id}", userId);
        }
    }

    public async Task ProcessBatchUserProfileEmbeddingAsync()
    {
        _logger.LogInformation("Starting batch user profile embedding job...");

        try
        {
            var aiConfig = await _sender.Send(new GetAIConfigQuery());

            // Fetch all learner profiles
            var profiles = await _context.LearnerProfiles
                .AsNoTracking()
                .ToListAsync();

            if (profiles.Count == 0)
            {
                _logger.LogWarning("No learner profiles found for batch embedding.");
                return;
            }

            _logger.LogInformation("Found {Count} learner profiles to batch embed.", profiles.Count);

            // Bulk-resolve user identities
            var userIds = profiles
                .Where(p => !string.IsNullOrEmpty(p.StudentId))
                .Select(p => p.StudentId!)
                .Distinct()
                .ToList();

            var identities = await _identityService.GetUserIdentitiesByIdsAsync(userIds, CancellationToken.None);
            var identityMap = identities.ToDictionary(u => u.Id, u => u);

            // Bulk-resolve all category and topic names once
            var allCategoryIds = profiles
                .Where(p => !string.IsNullOrEmpty(p.PreferredCategoryIds))
                .SelectMany(p => JsonSerializer.Deserialize<List<int>>(p.PreferredCategoryIds) ?? [])
                .Distinct()
                .ToList();

            var allTopicIds = profiles
                .Where(p => !string.IsNullOrEmpty(p.PreferredTopicIds))
                .SelectMany(p => JsonSerializer.Deserialize<List<int>>(p.PreferredTopicIds) ?? [])
                .Distinct()
                .ToList();

            var categoryMap = allCategoryIds.Count > 0
                ? await _context.Categories
                    .Where(c => allCategoryIds.Contains(c.Id))
                    .ToDictionaryAsync(c => c.Id, c => c.Title)
                : new Dictionary<int, string>();

            var topicMap = allTopicIds.Count > 0
                ? await _context.Topics
                    .Where(t => allTopicIds.Contains(t.Id))
                    .ToDictionaryAsync(t => t.Id, t => t.Name)
                : new Dictionary<int, string>();

            // Build user payloads for users that exist in identity store
            var userPayloads = profiles
                .Where(p => !string.IsNullOrEmpty(p.StudentId) && identityMap.ContainsKey(p.StudentId!))
                .Select(p =>
                {
                    var identity = identityMap[p.StudentId!];

                    var catNames = string.IsNullOrEmpty(p.PreferredCategoryIds)
                        ? new List<string>()
                        : (JsonSerializer.Deserialize<List<int>>(p.PreferredCategoryIds) ?? [])
                            .Select(id => categoryMap.TryGetValue(id, out var n) ? n : null)
                            .Where(n => n != null)
                            .Select(n => n!)
                            .ToList();

                    var topicNamesList = string.IsNullOrEmpty(p.PreferredTopicIds)
                        ? new List<string>()
                        : (JsonSerializer.Deserialize<List<int>>(p.PreferredTopicIds) ?? [])
                            .Select(id => topicMap.TryGetValue(id, out var n) ? n : null)
                            .Where(n => n != null)
                            .Select(n => n!)
                            .ToList();

                    return BuildUserPayload(p.StudentId!, identity.Email, identity.FullName, p, catNames, topicNamesList);
                })
                .ToList();

            var payload = new
            {
                user_profiles = userPayloads,
                embedding_config = BuildEmbeddingConfig(aiConfig),
                qdrant_config = BuildQdrantConfig(aiConfig, "edunary_users"),
            };

            var url = $"{aiConfig.AICenterBaseUrl}api/user-embeddings/embed-batch";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload));

            if (!isSuccess)
            {
                _logger.LogError("AI Center batch user embed failed: {Body}", body);
                await NotifyAdminAsync("UserEmbeddingUpdate", "Failed");
                return;
            }

            try
            {
                var response = JsonSerializer.Deserialize<JsonElement>(body);
                var totalEmbedded = response.TryGetProperty("total_embedded", out var tp)
                    ? tp.GetInt32() : profiles.Count;
                _logger.LogInformation(
                    "Batch user embedding completed: {Embedded}/{Total} profiles embedded.",
                    totalEmbedded, profiles.Count);
            }
            catch
            {
                _logger.LogInformation("Batch user embedding completed for {Count} profiles.", profiles.Count);
            }

            await NotifyAdminAsync("UserEmbeddingUpdate", "Completed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Batch user profile embedding job failed.");
            await NotifyAdminAsync("UserEmbeddingUpdate", "Failed");
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private static object BuildUserPayload(
        string userId,
#nullable enable
        string? email,
        string? fullName,
        Domain.Entities.LearnerProfile? profile,
        List<string> categoryNames,
        List<string> topicNames)
    {
        return new
        {
            user_id = userId,
            user_name = email ?? "",
            full_name = fullName ?? "",
            goal = profile?.Goal,
            skill_level = profile?.SkillLevel,
            preferred_categories = categoryNames,
            preferred_topics = topicNames,
            weekly_hours = profile?.WeeklyHours,
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

    private async Task NotifyAdminAsync(string eventName, string state)
    {
        try
        {
            await _notifyService.SendMessage(
                sender: "system",
                message: JsonSerializer.Serialize(new
                {
                    state,
                    timestamp = DateTime.UtcNow
                }),
                method: eventName);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not send SignalR notification for {Event}.", eventName);
        }
    }
}
