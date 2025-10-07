
using Edunary.Application.Categories.Queries.GetCategoriesWithPagination;
using Edunary.Application.Common.Models;
using Edunary.Application.TodoItems.Queries.GetTodoItemsWithPagination;

namespace Edunary.Web.Endpoints;

public class Categories : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetCategories);
    }
    public async Task<PaginatedList<CategoryDto>> GetCategories(ISender sender, [AsParameters] GetCategoriesWithPaginationQuery query)
    {
        return await sender.Send(query);
    }
}
