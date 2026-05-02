using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Edunary.Application.CourseEmbeddings.Queries.GetCourseEmbeddingSyncStatus;

public record GetCourseEmbeddingSyncStatusQuery : IRequest<ReturnResult<CourseEmbeddingSyncStatusDto>>
{
#nullable enable
    public string? SearchText { get; init; }
    public string StatusFilter { get; init; } = "All"; // "All" | "Embedded" | "Missing"
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetCourseEmbeddingSyncStatusQueryHandler
    : IRequestHandler<GetCourseEmbeddingSyncStatusQuery, ReturnResult<CourseEmbeddingSyncStatusDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IAICenterClient _aiCenterClient;
    private readonly IIdentityService _identityService;
    private readonly ISender _sender;

    public GetCourseEmbeddingSyncStatusQueryHandler(
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

    public async Task<ReturnResult<CourseEmbeddingSyncStatusDto>> Handle(
        GetCourseEmbeddingSyncStatusQuery request, CancellationToken cancellationToken)
    {
        // 1. Fetch all public course IDs + titles (cheap — no huge payload)
        var allPublicCourses = await _context.Courses
            .Where(c => c.Status == Domain.Enums.CourseStatus.Public)
            .Select(c => new { c.Id, c.Title, c.CreatedBy })
            .ToListAsync(cancellationToken);

        var allPublicIds = allPublicCourses.Select(c => c.Id).ToList();

        if (allPublicIds.Count == 0)
            return new ReturnResult<CourseEmbeddingSyncStatusDto>
            {
                Message = "No public courses found.",
                Result = new CourseEmbeddingSyncStatusDto
                {
                    TotalPublicCourses = 0,
                    TotalEmbedded = 0,
                    TotalMissing = 0,
                    Data = new PaginatedList<CourseEmbeddingItemDto>([], 0, request.PageNumber, request.PageSize)
                }
            };

        // 2. Ask AI Center which of these IDs are actually embedded in Qdrant
        var aiConfig = await _sender.Send(new GetAIConfigQuery(), cancellationToken);

        HashSet<int> embeddedIdsSet;

        if (string.IsNullOrEmpty(aiConfig.AICenterBaseUrl))
        {
            embeddedIdsSet = [];
        }
        else
        {
            var payload = new
            {
                course_ids = allPublicIds,
                qdrant_config = new
                {
                    url = aiConfig.QdrantUrl,
                    api_key = aiConfig.QdrantApiKey,
                    collection = "edunary_courses",
                }
            };

            var url = $"{aiConfig.AICenterBaseUrl}api/course-embeddings/sync-status";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload), cancellationToken);

            if (isSuccess)
            {
                var result = JsonSerializer.Deserialize<JsonElement>(body);
                var embeddedIds = result.TryGetProperty("embedded_ids", out var embProp)
                    ? embProp.EnumerateArray().Select(x => x.GetInt32()).ToList()
                    : new List<int>();
                embeddedIdsSet = embeddedIds.ToHashSet();
            }
            else
            {
                embeddedIdsSet = [];
            }
        }

        // 3. Apply StatusFilter on the full list in-memory
        var filteredCourses = allPublicCourses.Where(c =>
            request.StatusFilter switch
            {
                "Embedded" => embeddedIdsSet.Contains(c.Id),
                "Missing" => !embeddedIdsSet.Contains(c.Id),
                _ => true,
            }
        ).ToList();

        // 4. Apply SearchText filter (by ID or title) in-memory
        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var q = request.SearchText.Trim().ToLowerInvariant();
            filteredCourses = filteredCourses
                .Where(c => c.Id.ToString().Contains(q)
                         || (c.Title?.ToLowerInvariant().Contains(q) ?? false))
                .ToList();
        }

        var totalFilteredCount = filteredCourses.Count;

        // 5. Paginate
        var pagedCourses = filteredCourses
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        // 6. Resolve instructor names only for this page (small batch)
        List<CourseEmbeddingItemDto> items = [];

        if (pagedCourses.Count > 0)
        {
            var instructorIds = pagedCourses
                .Where(c => !string.IsNullOrEmpty(c.CreatedBy))
                .Select(c => c.CreatedBy!)
                .Distinct()
                .ToList();

            var instructors = await _identityService.GetUserIdentitiesByIdsAsync(instructorIds, cancellationToken);
            var instructorMap = instructors.ToDictionary(u => u.Id, u => u.FullName ?? "");

            // 7. Map to DTO
            items = pagedCourses.Select(c =>
            {
                var instructorName = !string.IsNullOrEmpty(c.CreatedBy) && instructorMap.TryGetValue(c.CreatedBy, out var name)
                    ? name
                    : "Unknown Instructor";

                return new CourseEmbeddingItemDto
                {
                    CourseId = c.Id,
                    Title = c.Title,
                    InstructorName = instructorName,
                    IsEmbedded = embeddedIdsSet.Contains(c.Id),
                };
            }).ToList();
        }

        return new ReturnResult<CourseEmbeddingSyncStatusDto>
        {
            Message = "Success",
            Result = new CourseEmbeddingSyncStatusDto
            {
                TotalPublicCourses = allPublicIds.Count,
                TotalEmbedded = embeddedIdsSet.Count,
                TotalMissing = allPublicIds.Count - embeddedIdsSet.Count,
                Data = new PaginatedList<CourseEmbeddingItemDto>(items, totalFilteredCount, request.PageNumber, request.PageSize)
            }
        };
    }
}
