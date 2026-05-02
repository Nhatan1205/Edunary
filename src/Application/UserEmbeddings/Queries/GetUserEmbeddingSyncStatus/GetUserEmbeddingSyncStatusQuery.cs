using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Edunary.Application.UserEmbeddings.Queries.GetUserEmbeddingSyncStatus;

public record GetUserEmbeddingSyncStatusQuery : IRequest<ReturnResult<UserEmbeddingSyncStatusDto>>
{
#nullable enable
    public string? SearchText { get; init; }
    public string StatusFilter { get; init; } = "All"; // "All" | "Embedded" | "Missing"
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetUserEmbeddingSyncStatusQueryHandler
    : IRequestHandler<GetUserEmbeddingSyncStatusQuery, ReturnResult<UserEmbeddingSyncStatusDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IAICenterClient _aiCenterClient;
    private readonly IIdentityService _identityService;
    private readonly ISender _sender;

    public GetUserEmbeddingSyncStatusQueryHandler(
        IApplicationDbContext context,
        IAICenterClient aiCenterClient,
        ISender sender,
        IIdentityService identityService)
    {
        _context = context;
        _aiCenterClient = aiCenterClient;
        _sender = sender;
        _identityService = identityService;
    }

    public async Task<ReturnResult<UserEmbeddingSyncStatusDto>> Handle(
        GetUserEmbeddingSyncStatusQuery request, CancellationToken cancellationToken)
    {
        // 1. Fetch all user IDs that have a LearnerProfile
        var profileUserIds = await _context.LearnerProfiles
            .AsNoTracking()
            .Where(p => !string.IsNullOrEmpty(p.StudentId))
            .Select(p => p.StudentId!)
            .Distinct()
            .ToListAsync(cancellationToken);

        if (profileUserIds.Count == 0)
            return new ReturnResult<UserEmbeddingSyncStatusDto>
            {
                Message = "No users with learner profiles found.",
                Result = new UserEmbeddingSyncStatusDto
                {
                    TotalUsers = 0,
                    TotalEmbedded = 0,
                    TotalMissing = 0,
                    Data = new PaginatedList<UserEmbeddingItemDto>([], 0, request.PageNumber, request.PageSize)
                }
            };

        // 2. Ask AI Center which of these user IDs are actually embedded in Qdrant
        var aiConfig = await _sender.Send(new GetAIConfigQuery(), cancellationToken);

        HashSet<string> embeddedIdsSet;

        if (string.IsNullOrEmpty(aiConfig.AICenterBaseUrl))
        {
            embeddedIdsSet = [];
        }
        else
        {
            var payload = new
            {
                user_ids = profileUserIds,
                qdrant_config = new
                {
                    url = aiConfig.QdrantUrl,
                    api_key = aiConfig.QdrantApiKey,
                    collection = "edunary_users",
                }
            };

            var url = $"{aiConfig.AICenterBaseUrl}api/user-embeddings/sync-status";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload), cancellationToken);

            if (isSuccess)
            {
                var result = JsonSerializer.Deserialize<JsonElement>(body);
                var embeddedIds = result.TryGetProperty("embedded_ids", out var embProp)
                    ? embProp.EnumerateArray().Select(x => x.GetString()!).ToList()
                    : new List<string>();
                embeddedIdsSet = embeddedIds.ToHashSet();
            }
            else
            {
                embeddedIdsSet = [];
            }
        }

        // 3. Bulk-resolve identities for all profile users
        var identities = await _identityService.GetUserIdentitiesByIdsAsync(profileUserIds, cancellationToken);
        var identityMap = identities.ToDictionary(u => u.Id, u => u);

        // 4. Build flat list of items with resolved identity
        var allItems = profileUserIds
            .Select(uid =>
            {
                identityMap.TryGetValue(uid, out var identity);
                return new
                {
                    UserId = uid,
                    FullName = identity?.FullName ?? "",
                    Email = identity?.Email ?? "",
                    IsEmbedded = embeddedIdsSet.Contains(uid),
                };
            })
            .ToList();

        // 5. Apply StatusFilter in-memory
        var filteredItems = allItems.Where(u =>
            request.StatusFilter switch
            {
                "Embedded" => u.IsEmbedded,
                "Missing" => !u.IsEmbedded,
                _ => true,
            }
        ).ToList();

        // 6. Apply SearchText filter (by name or email) in-memory
        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var q = request.SearchText.Trim().ToLowerInvariant();
            filteredItems = filteredItems
                .Where(u => (u.FullName?.ToLowerInvariant().Contains(q) ?? false)
                         || (u.Email?.ToLowerInvariant().Contains(q) ?? false)
                         || u.UserId.ToLowerInvariant().Contains(q))
                .ToList();
        }

        var totalFilteredCount = filteredItems.Count;

        // 7. Paginate
        var pagedItems = filteredItems
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new UserEmbeddingItemDto
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                IsEmbedded = u.IsEmbedded,
            })
            .ToList();

        return new ReturnResult<UserEmbeddingSyncStatusDto>
        {
            Message = "Success",
            Result = new UserEmbeddingSyncStatusDto
            {
                TotalUsers = profileUserIds.Count,
                TotalEmbedded = embeddedIdsSet.Count,
                TotalMissing = profileUserIds.Count - embeddedIdsSet.Count,
                Data = new PaginatedList<UserEmbeddingItemDto>(pagedItems, totalFilteredCount, request.PageNumber, request.PageSize)
            }
        };
    }
}
