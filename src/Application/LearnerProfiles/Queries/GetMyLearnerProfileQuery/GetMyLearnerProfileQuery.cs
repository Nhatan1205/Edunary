using System.Text.Json;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.LearnerProfiles.Queries.GetMyLearnerProfileQuery;

public record GetMyLearnerProfileQuery : IRequest<LearnerProfileDto>;

public class GetMyLearnerProfileQueryHandler : IRequestHandler<GetMyLearnerProfileQuery, LearnerProfileDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetMyLearnerProfileQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<LearnerProfileDto> Handle(GetMyLearnerProfileQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        if (string.IsNullOrEmpty(userId)) return null;

        var profile = await _context.LearnerProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.StudentId == userId, cancellationToken);

        if (profile == null) return null;

        return new LearnerProfileDto
        {
            Goal = profile.Goal,
            SkillLevel = profile.SkillLevel,
            PreferredCategoryIds = string.IsNullOrEmpty(profile.PreferredCategoryIds) ? new() : JsonSerializer.Deserialize<List<int>>(profile.PreferredCategoryIds) ?? new(),
            PreferredTopicIds = string.IsNullOrEmpty(profile.PreferredTopicIds) ? new() : JsonSerializer.Deserialize<List<int>>(profile.PreferredTopicIds) ?? new(),
            WeeklyHours = profile.WeeklyHours,
        };
    }
}
