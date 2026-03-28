using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Roadmaps.Models;

namespace Edunary.Application.Roadmaps.Queries.GetPublicRoadmapDetailQuery;

public class GetPublicRoadmapDetailQuery : IRequest<PublicRoadmapDetailDto>
{
    public int Id { get; init; }
}

public class GetPublicRoadmapDetailQueryHandler : IRequestHandler<GetPublicRoadmapDetailQuery, PublicRoadmapDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;

    public GetPublicRoadmapDetailQueryHandler(
        IApplicationDbContext context,
        IMapper mapper,
        IIdentityService identityService)
    {
        _context = context;
        _mapper = mapper;
        _identityService = identityService;
    }

    public async Task<PublicRoadmapDetailDto> Handle(GetPublicRoadmapDetailQuery request, CancellationToken cancellationToken)
    {
        var roadmap = await _context.Roadmaps
            .Include(r => r.RoadmapTopic)
            .Where(r => r.Id == request.Id && r.IsPublic)
            .FirstOrDefaultAsync(cancellationToken);

        if (roadmap == null) return null!;

        // AutoMapper xử lý phần map được
        var dto = _mapper.Map<PublicRoadmapDetailDto>(roadmap);

        // Enrich user data
        if (dto.Creator != null)
        {
            dto.Creator.Name = await _identityService.GetFullNameAsync(roadmap.CreatedBy);
            dto.Creator.Avatar = await _identityService.GetUserAvatarAsync(roadmap.CreatedBy);
        }

        // Enrich GraphData 
        dto.GraphData = await EnrichGraphDataAsync(roadmap.GraphData, cancellationToken);

        return dto;
    }

    private async Task<RoadmapGraphResponse> EnrichGraphDataAsync(string graphDataJson, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(graphDataJson))
            return null;

        RoadmapGraphData graphData;
        try
        {
            graphData = JsonSerializer.Deserialize<RoadmapGraphData>(graphDataJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (JsonException)
        {
            return null;
        }

        if (graphData?.Nodes == null || graphData.Nodes.Count == 0)
        {
            return new RoadmapGraphResponse
            {
                Nodes = new List<RoadmapNodeResponse>(),
                Edges = graphData?.Edges ?? new List<RoadmapEdgeData>()
            };
        }

        // Collect all CourseIds and batch-query from the database
        var courseIds = graphData.Nodes
            .Select(n => n.CourseId)
            .Distinct()
            .ToList();

        var courses = await _context.Courses
            .Where(c => courseIds.Contains(c.Id))
            .Select(c => new { c.Id, c.Title, c.ImageUrl, c.TotalStudents, c.Ratings })
            .ToDictionaryAsync(c => c.Id, cancellationToken);

        // Map nodes, enriching with live course data
        var enrichedNodes = graphData.Nodes
            .Where(n => courses.ContainsKey(n.CourseId)) // skip nodes whose course was deleted
            .Select(n => new RoadmapNodeResponse
            {
                ClientNodeId = n.ClientNodeId,
                Course = new CourseNodeDto
                {
                    CourseId = n.CourseId,
                    Title = courses[n.CourseId].Title,
                    ImageUrl = courses[n.CourseId].ImageUrl,
                    TotalStudents = courses[n.CourseId].TotalStudents,
                    Ratings = courses[n.CourseId].Ratings,
                },
                PositionX = n.PositionX,
                PositionY = n.PositionY,
                SortOrder = n.SortOrder,
            })
            .ToList();

        // Filter out edges that reference deleted nodes
        var validNodeIds = new HashSet<string>(enrichedNodes.Select(n => n.ClientNodeId));
        var validEdges = graphData.Edges
            .Where(e => validNodeIds.Contains(e.SourceNodeId) && validNodeIds.Contains(e.TargetNodeId))
            .ToList();

        return new RoadmapGraphResponse
        {
            Nodes = enrichedNodes,
            Edges = validEdges
        };
    }
}
