using System.Text.Json;
using Edunary.Application.Roadmaps.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Roadmaps.Queries.GetPublicRoadmapsQuery;

public class CreatorDto
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Avatar { get; set; }
}

public class PublicRoadmapListDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string TopicTitle { get; set; }
    public int CourseCount { get; set; }
    public CreatorDto Creator { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Roadmap, PublicRoadmapListDto>()
                .ForMember(dest => dest.TopicTitle, opt => opt.MapFrom(src => src.RoadmapTopic.Title))
                .ForMember(dest => dest.CourseCount, opt => opt.MapFrom(src => GetNodeCount(src.GraphData)))
                .ForMember(dest => dest.Creator, opt => opt.MapFrom(src => new CreatorDto { Id = src.CreatedBy }));
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
