using Edunary.Domain.Entities;

namespace Edunary.Application.Categories.Commands.CreateCategoryCommand;

public class CreatedCategoryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Category, CreatedCategoryDto>();
        }
    }
}
