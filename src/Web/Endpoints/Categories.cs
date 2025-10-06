
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
    public async Task<IResult> GetCategories(ISender sender, [AsParameters] GetCategoriesWithPaginationQuery query)
    {
        var result = await sender.Send(query);
        if(!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
}
