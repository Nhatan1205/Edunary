using Edunary.Domain.Entities;

namespace Edunary.Application.Topics.Commands.CreateTopicCommand;
public class CreatedTopicDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Topic, CreatedTopicDto>();
        }
    }
}
