using System.Text.Json;
using Edunary.Application.Roadmaps.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Roadmaps.Queries.GetRelatedRoadmapsByCourseIdQuery;

public class RelatedRoadmapDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string TopicTitle { get; set; }
    public int CourseCount { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Roadmap, RelatedRoadmapDto>()
                .ForMember(dest => dest.TopicTitle, opt => opt.MapFrom(src => src.RoadmapTopic.Title))
                .ForMember(dest => dest.CourseCount, opt => opt.MapFrom(src => GetNodeCount(src.GraphData)));
        }

        private static int GetNodeCount(string graphData)
        {
            if (string.IsNullOrWhiteSpace(graphData))
                return 0;

            try
            {
                var data = JsonSerializer.Deserialize<RoadmapGraphData>(graphData, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                return data?.Nodes?.Count ?? 0;
            }
            catch
            {
                return 0;
            }
        }
    }
}
