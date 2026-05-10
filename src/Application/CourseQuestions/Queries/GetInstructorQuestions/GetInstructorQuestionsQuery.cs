using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

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

        // Base: only questions in courses owned by this instructor
        var query = _context.CourseQuestions
            .Include(q => q.Course)
            .Where(q => q.Course.CreatedBy == instructorId);

        // Optional: filter to specific course
        if (request.CourseId.HasValue)
        {
            query = query.Where(q => q.CourseId == request.CourseId.Value);
        }

        // Search
        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var lower = request.SearchText.ToLower();
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

        foreach (var item in paged.Items)
        {
            if (userMap.TryGetValue(item.CreatedBy, out var user))
            {
                item.AuthorName = user.FullName;
                item.AuthorAvatar = user.Avatar;
            }
        }

        return paged;
    }
}
