using System.Text.Json;
using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Roadmaps.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Roadmaps.Commands.CreateRoadmapCommand;


[ActivityLog(ActivityType.CreateRoadmap, "Create Roadmap")]
public record CreateRoadmapCommand : IRequest<ReturnResult<CreatedRoadmapDto>>
{
    public string Title { get; init; }

    public string Subtitle { get; init; }

    public string Description { get; init; }

    public int RoadmapTopicId { get; init; }

    public CourseLevel SkillLevel { get; init; }
}

public class CreateRoadmapCommandHandler : IRequestHandler<CreateRoadmapCommand, ReturnResult<CreatedRoadmapDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateRoadmapCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ReturnResult<CreatedRoadmapDto>> Handle(CreateRoadmapCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Verify that the RoadmapTopic exists
            var topicExists = await _context.RoadmapTopics
                .AnyAsync(t => t.Id == request.RoadmapTopicId, cancellationToken);

            if (!topicExists)
            {
                return new ReturnResult<CreatedRoadmapDto>
                {
                    Result = null,
                    Message = "RoadmapTopic not found."
                };
            }

            // Initialize empty graph data
            var emptyGraphData = new RoadmapGraphData();
            var graphDataJson = JsonSerializer.Serialize(emptyGraphData);

            var entity = new Roadmap
            {
                Title = request.Title,
                Subtitle = request.Subtitle,
                Description = request.Description,
                RoadmapTopicId = request.RoadmapTopicId,
                Level = request.SkillLevel,
                IsPublic = false,
                GraphData = graphDataJson
            };

            _context.Roadmaps.Add(entity);

            var result = await _context.SaveChangesAsync(cancellationToken);

            var dto = _mapper.Map<CreatedRoadmapDto>(entity);

            if (result > 0)
            {
                return new ReturnResult<CreatedRoadmapDto>
                {
                    Result = dto,
                    Message = "Roadmap created successfully"
                };
            }

            return new ReturnResult<CreatedRoadmapDto>
            {
                Result = null,
                Message = "Roadmap creation failed"
            };
        }
        catch (Exception ex)
        {
            return new ReturnResult<CreatedRoadmapDto>
            {
                Result = null,
                Message = $"An unexpected error occurred while creating roadmap: {ex.Message}"
            };
        }
    }
}
