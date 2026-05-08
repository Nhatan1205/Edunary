using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;

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

    public GetCourseAnswersQueryHandler(
        IApplicationDbContext context,
        IMapper mapper,
        IIdentityService identityService)
    {
        _context = context;
        _mapper = mapper;
        _identityService = identityService;
    }

    public async Task<PaginatedList<CourseAnswerDto>> Handle(GetCourseAnswersQuery request, CancellationToken cancellationToken)
    {
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

        foreach (var item in courseAnswerDto.Items)
        {
            if (userMap.TryGetValue(item.CreatedBy, out var user))
            {
                item.AuthorName = user.FullName;
                item.AuthorAvatar = user.Avatar;
            }
        }

        return courseAnswerDto;
    }
}
