
using Edunary.Application.Categories.Commands.CreateCategoryCommand;
using Edunary.Application.Categories.Commands.DeleteCategoryCommand;
using Edunary.Application.Categories.Commands.UpdateCategoryCommand;
using Edunary.Application.Categories.Queries.GetAdminCategoriesWithPaginationQuery;
using Edunary.Application.Categories.Queries.GetCategoriesWithPagination;
using Edunary.Application.Categories.Queries.GetCategoryStatsQuery;
using Edunary.Application.Common.Models;
using Edunary.Domain.Constants;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class Categories : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetCategories);

        // Admin
        app.MapGroup(this)
            .RequireAuthorization(Policies.SuperAdmin)
            .MapGet(AdminGetCategoryStats, "admin/stats")
            .MapGet(AdminGetCategories, "admin")
            .MapPost(AdminCreateCategory, "admin")
            .MapPut(AdminUpdateCategory, "admin")
            .MapDelete(AdminDeleteCategory, "admin");
    }

    public async Task<PaginatedList<CategoryDto>> GetCategories(
        ISender sender, [AsParameters] GetCategoriesWithPaginationQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<CategoryStatsDto> AdminGetCategoryStats(ISender sender)
    {
        return await sender.Send(new GetCategoryStatsQuery());
    }

    public async Task<PaginatedList<AdminCategoryDto>> AdminGetCategories(
        ISender sender, [AsParameters] GetAdminCategoriesWithPaginationQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<ReturnResult<CreatedCategoryDto>> AdminCreateCategory(ISender sender, CreateCategoryCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result> AdminUpdateCategory(ISender sender, [FromBody] UpdateCategoryCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result> AdminDeleteCategory(ISender sender, [FromBody] DeleteCategoryCommand command)
    {
        return await sender.Send(command);
    }
}
