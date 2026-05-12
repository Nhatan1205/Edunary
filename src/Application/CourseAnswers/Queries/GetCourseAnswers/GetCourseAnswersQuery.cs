using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseAnswers.Queries.GetCourseAnswers;

public record GetCourseAnswersQuery : IRequest<PaginatedList<CourseAnswerDto>>
{
    public int QuestionId { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetCourseAnswersQueryHandler : IRequestHandler<GetCourseAnswersQuery, PaginatedList<CourseAnswerDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public GetCourseAnswersQueryHandler(
        IApplicationDbContext context,
        IMapper mapper,
        IIdentityService identityService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedList<CourseAnswerDto>> Handle(GetCourseAnswersQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var courseAnswerDto = await _context.CourseAnswers
            .Where(a => a.QuestionId == request.QuestionId)
            .OrderByDescending(a => a.IsTopAnswer)
            .ThenBy(a => a.Created)
            .ProjectTo<CourseAnswerDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        // fetch user info
        var authorIds = courseAnswerDto.Items
            .Select(a => a.CreatedBy)
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        var users = await _identityService.GetUserIdentitiesByIdsAsync(authorIds, cancellationToken);
        var userMap = users.ToDictionary(u => u.Id);

        // check user's upvote for each question
        var answerIds = courseAnswerDto.Items.Select(a => a.Id).ToList();
        var upvotedIds = await _context.AnswerUpvotes
            .Where(u => u.VoterId == userId && answerIds.Contains(u.AnswerId))
            .Select(u => u.AnswerId)
            .ToHashSetAsync(cancellationToken);

        // get instructor id for the course this question belongs to
        var instructorId = await _context.CourseQuestions
            .Where(q => q.Id == request.QuestionId)
            .Select(q => q.Course.CreatedBy)
            .FirstOrDefaultAsync(cancellationToken);

        foreach (var item in courseAnswerDto.Items)
        {
            if (userMap.TryGetValue(item.CreatedBy, out var user))
            {
                item.AuthorName = user.FullName;
                item.AuthorAvatar = user.Avatar;
            }
            item.HasUpvoted = upvotedIds.Contains(item.Id);
            item.IsInstructor = !string.IsNullOrEmpty(instructorId) && item.CreatedBy == instructorId;
        }

        return courseAnswerDto;
    }
}
