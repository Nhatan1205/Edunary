using System.Text.Json;
using Edunary.Application.Roadmaps.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Roadmaps.Queries.GetRoadmapsAuthorQuery;
public class RoadmapAuthorDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Visibility { get; set; }
    public int TopicCount { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Roadmap, RoadmapAuthorDto>()
                .ForMember(dest => dest.Visibility, opt => opt.MapFrom(src => src.IsPublic ? "Public" : "Private"))
                .ForMember(dest => dest.TopicCount, opt => opt.MapFrom(src => GetNodeCount(src.GraphData)));
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
