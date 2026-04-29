using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Roadmaps.Queries.GetMyAIRoadmapsQuery;

public record GetMyAIRoadmapsQuery : IRequest<List<MyAIRoadmapDto>>;

public class GetMyAIRoadmapsQueryHandler : IRequestHandler<GetMyAIRoadmapsQuery, List<MyAIRoadmapDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetMyAIRoadmapsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<MyAIRoadmapDto>> Handle(GetMyAIRoadmapsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        if (string.IsNullOrEmpty(userId)) return new List<MyAIRoadmapDto>();

        return await _context.Roadmaps
            .Where(r => r.IsAiGenerated && r.CreatedBy == userId)
            .OrderByDescending(r => r.Created)
            .Select(r => new MyAIRoadmapDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                SkillLevel = r.Level.ToString(),
                UserRating = r.UserRating,
                Created = r.Created
            })
            .ToListAsync(cancellationToken);
    }
}
