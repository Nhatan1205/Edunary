using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Edunary.Application.TodoItems.Queries.GetTodoItemsWithPagination;
using Edunary.Domain.Entities;

namespace Edunary.Application.Categories.Queries.GetCategoriesWithPagination;
public class CategoryDto
{
    public int Id { get; init; }

    public string Title { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Category, CategoryDto>();
        }
    }
}
