using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Edunary.Application.CourseQuestions.Queries.GetInstructorQuestions;

public record GetInstructorQuestionsQuery : IRequest<PaginatedList<InstructorCourseQuestionDto>>
{
    public int? CourseId { get; init; }
    public string SearchText { get; init; }
    public string SortBy { get; init; } = "newestFirst";
    public string FilterBy { get; init; } = "all";
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public class GetInstructorQuestionsQueryHandler
    : IRequestHandler<GetInstructorQuestionsQuery, PaginatedList<InstructorCourseQuestionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetInstructorQuestionsQueryHandler(
        IApplicationDbContext context,
        IMapper mapper,
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<PaginatedList<InstructorCourseQuestionDto>> Handle(
        GetInstructorQuestionsQuery request, CancellationToken cancellationToken)
    {
        var instructorId = _currentUserService.UserId;

        // Courses the instructor can access for QA: owned OR collaborated with QA permission
        var accessibleCourseIds = _context.Courses
            .Where(c => c.CreatedBy == instructorId ||
                        c.Collaborators.Any(cc =>
                            cc.UserId == instructorId &&
                            cc.InviteStatus == CollaboratorInviteStatus.Accepted &&
                            cc.Permissions.HasFlag(CoursePermission.QA)))
            .Select(c => c.Id);

        var query = _context.CourseQuestions
            .Where(q => accessibleCourseIds.Contains(q.CourseId));

        // Optional: filter to specific course
        if (request.CourseId.HasValue)
        {
            query = query.Where(q => q.CourseId == request.CourseId.Value);
        }

        // Search
        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var lower = request.SearchText.ToLower().Trim();
            query = query.Where(q =>
                q.Title.ToLower().Contains(lower) ||
                (q.Detail != null && q.Detail.ToLower().Contains(lower)));
        }

        // FilterBy
        query = request.FilterBy switch
        {
            "unread" => query.Where(q => !q.IsRead),
            "noTopAnswer" => query.Where(q => !q.Answers.Any(a => a.IsTopAnswer)),
            "noAnswers" => query.Where(q => q.AnswerCount == 0),
            "noInstructorAnswer" => query.Where(q => !q.Answers.Any(a => a.CreatedBy == instructorId)),
            "featured" => query.Where(q => q.IsFeatured),
            _ => query
        };

        // SortBy
        query = request.SortBy switch
        {
            "oldestFirst" => query.OrderBy(q => q.Created),
            "mostUpvoted" => query.OrderByDescending(q => q.UpvoteCount),
            _ => query.OrderByDescending(q => q.Created) // newestFirst default
        };

        var paged = await query
            .ProjectTo<InstructorCourseQuestionDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        // Bulk-fetch author info
        var authorIds = paged.Items
            .Select(q => q.CreatedBy)
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        var users = await _identityService.GetUserIdentitiesByIdsAsync(authorIds, cancellationToken);
        var userMap = users.ToDictionary(u => u.Id);

        var questionIds = paged.Items.Select(q => q.Id).ToList();
        var upvotedIds = await _context.QuestionUpvotes
            .Where(u => u.VoterId == instructorId && questionIds.Contains(u.QuestionId))
            .Select(u => u.QuestionId)
            .ToHashSetAsync(cancellationToken);

        foreach (var item in paged.Items)
        {
            if (userMap.TryGetValue(item.CreatedBy, out var user))
            {
                item.AuthorName = user.FullName;
                item.AuthorAvatar = user.Avatar;
            }
            item.HasUpvoted = upvotedIds.Contains(item.Id);
        }

        var questionsWithItem = paged.Items.Where(q => !string.IsNullOrEmpty(q.ItemId)).ToList();
        if (questionsWithItem.Count > 0)
        {
            var courseIdList = questionsWithItem.Select(q => q.CourseId).Distinct().ToList();

            var courseContentMap = await _context.Courses
                .Where(c => courseIdList.Contains(c.Id))
                .Select(c => new { c.Id, c.Content })
                .ToDictionaryAsync(c => c.Id, c => c.Content, cancellationToken);

            foreach (var q in questionsWithItem)
            {
                if (courseContentMap.TryGetValue(q.CourseId, out var content))
                    q.LectureName = FindLectureName(content, q.ItemId);
            }
        }

        return paged;
    }

    private static string FindLectureName(string courseContent, string itemId)
    {
        if (string.IsNullOrEmpty(courseContent)) return null;
        try
        {
            using var doc = JsonDocument.Parse(courseContent);
            foreach (var section in doc.RootElement.GetProperty("contents").EnumerateArray())
            foreach (var item in section.GetProperty("items").EnumerateArray())
            {
                if (item.GetProperty("itemId").GetString() == itemId)
                    return item.GetProperty("title").GetString();
            }
        }
        catch { }
        return null;
    }
}
