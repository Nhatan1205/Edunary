using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.CourseQuestions.Queries.GetCourseQuestions;

public record GetCourseQuestionsQuery : IRequest<PaginatedList<CourseQuestionDto>>
{
    public int CourseId { get; init; }

    public string ItemId { get; init; }

    public string SortBy { get; init; } = "recommended";

    public string FilterBy { get; init; } = "all";

    public string SearchText { get; init; }

    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public class GetCourseQuestionsQueryHandler
    : IRequestHandler<GetCourseQuestionsQuery, PaginatedList<CourseQuestionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetCourseQuestionsQueryHandler(
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

    public async Task<PaginatedList<CourseQuestionDto>> Handle(
        GetCourseQuestionsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var query = _context.CourseQuestions
            .Where(q => q.CourseId == request.CourseId);

        if (!string.IsNullOrWhiteSpace(request.ItemId))
        {
            query = query.Where(q => q.ItemId == request.ItemId);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var lower = request.SearchText.ToLower();
            query = query.Where(q =>
                q.Title.ToLower().Contains(lower) ||
                (q.Detail != null && q.Detail.ToLower().Contains(lower)));
        }

        if (request.FilterBy == "myQuestions")
        {
            query = query.Where(q => q.CreatedBy == userId);
        }
        else if (request.FilterBy == "noResponses")
        {
            query = query.Where(q => q.AnswerCount == 0);
        }

        query = request.SortBy switch
        {
            "mostRecent" => query.OrderByDescending(q => q.Created),
            "mostUpvoted" => query.OrderByDescending(q => q.UpvoteCount),
            _ => query.OrderByDescending(q => q.IsFeatured)
                      .ThenByDescending(q => q.UpvoteCount * 2 + q.AnswerCount)
                      .ThenByDescending(q => q.Created)
        };

        var courseQuestionDto = await query
            .ProjectTo<CourseQuestionDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        // fetch user info
        var authorIds = courseQuestionDto.Items
            .Select(q => q.CreatedBy)
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        var users = await _identityService.GetUserIdentitiesByIdsAsync(authorIds, cancellationToken);
        var userMap = users.ToDictionary(u => u.Id);

        // check user's upvote for each question
        var questionIds = courseQuestionDto.Items.Select(q => q.Id).ToList();
        var upvotedIds = await _context.QuestionUpvotes
            .Where(u => u.VoterId == userId && questionIds.Contains(u.QuestionId))
            .Select(u => u.QuestionId)
            .ToHashSetAsync(cancellationToken);

        foreach (var item in courseQuestionDto.Items)
        {
            if (userMap.TryGetValue(item.CreatedBy, out var user))
            {
                item.AuthorName = user.FullName;
                item.AuthorAvatar = user.Avatar;
            }
            item.HasUpvoted = upvotedIds.Contains(item.Id);
        }

        return courseQuestionDto;
    }
}
