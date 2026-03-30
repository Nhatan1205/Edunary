using Edunary.Application.Roadmaps.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Roadmaps.Queries.GetPublicRoadmapDetailQuery;

public class PublicRoadmapDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Description { get; set; }
    public RoadmapTopicInfo Topic { get; set; }
    public CourseLevel SkillLevel { get; set; }
    public PublicCreatorDto Creator { get; set; }
    public RoadmapGraphResponse GraphData { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Roadmap, PublicRoadmapDetailDto>()
                .ForMember(dest => dest.SkillLevel, opt => opt.MapFrom(src => src.Level))
                .ForMember(dest => dest.Topic, opt => opt.MapFrom(src => src.RoadmapTopic))
                .ForMember(dest => dest.Creator, opt => opt.MapFrom(src => new PublicCreatorDto { Id = src.CreatedBy }))
                .ForMember(dest => dest.GraphData, opt => opt.Ignore());

            CreateMap<RoadmapTopic, RoadmapTopicInfo>();
        }
    }
}

public class PublicCreatorDto
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Avatar { get; set; }
}

public class RoadmapTopicInfo
{
    public int Id { get; set; }
    public string Title { get; set; }
}
