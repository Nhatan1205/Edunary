
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
    public Task<PaginatedList<CategoryDto>> GetCategories(ISender sender, [AsParameters] GetCategoriesWithPaginationQuery query)
    {
        return sender.Send(query);
    }
}
