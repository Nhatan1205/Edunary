using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;

namespace Edunary.Application.Users.Queries.GetTopInstructorsQuery;

public record GetTopInstructorsQuery : IRequest<List<TopInstructorDto>>
{
    public int Count { get; init; } = 3;
}

public class GetTopInstructorsQueryHandler : IRequestHandler<GetTopInstructorsQuery, List<TopInstructorDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetTopInstructorsQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<List<TopInstructorDto>> Handle(GetTopInstructorsQuery request, CancellationToken cancellationToken)
    {
        // Group courses by creator to get instructor stats
        var instructorStats = await _context.Courses
            .GroupBy(c => c.CreatedBy)
            .Select(g => new
            {
                UserId = g.Key,
                TotalLearners = g.Sum(c => c.TotalStudents),
                TotalCourses = g.Count()
            })
            .OrderByDescending(x => x.TotalLearners)
            .Take(request.Count)
            .ToListAsync(cancellationToken);

        var result = new List<TopInstructorDto>();

        foreach (var stat in instructorStats)
        {
            var user = await _identityService.GetUserById(stat.UserId);
            if (user == null || string.IsNullOrEmpty(user.Id)) continue;

            result.Add(new TopInstructorDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Avatar = user.Avatar,
                Headline = user.Headline,
                TotalLearners = stat.TotalLearners,
                TotalCourses = stat.TotalCourses
            });
        }

        return result;
    }
}
