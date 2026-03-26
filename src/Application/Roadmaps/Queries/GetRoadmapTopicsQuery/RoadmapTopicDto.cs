using Edunary.Domain.Entities;

namespace Edunary.Application.Roadmaps.Queries.GetRoadmapTopicsQuery;

public class RoadmapTopicDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<RoadmapTopic, RoadmapTopicDto>();
        }
    }
}
