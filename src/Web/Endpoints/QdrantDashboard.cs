#nullable enable

using Edunary.Application.QdrantDashboard.Commands.DeleteQdrantCollection;
using Edunary.Application.QdrantDashboard.Queries.GetQdrantCollectionInfo;
using Edunary.Application.QdrantDashboard.Queries.GetQdrantCollections;
using Edunary.Application.QdrantDashboard.Queries.GetQdrantPoints;
using Edunary.Domain.Constants;

namespace Edunary.Web.Endpoints;

public class QdrantDashboard : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization(Policies.SuperAdmin)
            .MapGet(GetCollections)
            .MapGet(GetCollectionInfo, "{name}")
            .MapGet(GetPoints, "{name}/points")
            .MapDelete(DeleteCollection, "{name}");
    }

    public async Task<QdrantCollectionListDto> GetCollections(ISender sender)
        => await sender.Send(new GetQdrantCollectionsQuery());

    public async Task<IResult> GetCollectionInfo(ISender sender, string name)
    {
        var result = await sender.Send(new GetQdrantCollectionInfoQuery(name));
        return result != null ? Results.Ok(result) : Results.NotFound();
    }

    public async Task<QdrantPointListDto> GetPoints(
        ISender sender,
        string name,
        int limit = 20,
        string? offset = null,
        string? filterKey = null,
        string? filterValue = null)
        => await sender.Send(new GetQdrantPointsQuery
        {
            CollectionName = name,
            Limit = limit,
            Offset = offset,
            FilterKey = filterKey,
            FilterValue = filterValue,
        });

    public async Task<IResult> DeleteCollection(ISender sender, string name)
    {
        var result = await sender.Send(new DeleteQdrantCollectionCommand(name));
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}
