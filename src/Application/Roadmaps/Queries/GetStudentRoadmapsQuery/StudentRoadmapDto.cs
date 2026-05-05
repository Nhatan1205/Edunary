using System.Text.Json;
using Edunary.Application.Roadmaps.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Roadmaps.Queries.GetStudentRoadmapsQuery;

public class StudentRoadmapDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Description { get; set; }
    public string Level { get; set; }
    public DateTimeOffset Created { get; set; }
    public int NodeCount { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Roadmap, StudentRoadmapDto>()
                .ForMember(dest => dest.Level, opt => opt.MapFrom(src => src.Level.ToString()))
                .ForMember(dest => dest.NodeCount, opt => opt.MapFrom(src => GetNodeCount(src.GraphData)));
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
