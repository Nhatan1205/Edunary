using Edunary.Application.AdminDashboard.Queries.GetAdminDashboardSummaryQuery;
using Edunary.Application.AdminDashboard.Queries.GetAdminDashboardTrendQuery;
using Edunary.Application.AdminDashboard.Queries.GetAdminDashboardDistributionsQuery;
using Edunary.Domain.Constants;

namespace Edunary.Web.Endpoints;

public class AdminDashboard : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization(Policies.Admin)
            .MapGet(GetDashboardSummary, "summary")
            .MapGet(GetDashboardTrend, "trend")
            .MapGet(GetDashboardDistributions, "distributions");
    }

    public async Task<AdminDashboardSummaryDto> GetDashboardSummary(ISender sender)
    {
        return await sender.Send(new GetAdminDashboardSummaryQuery());
    }

    public async Task<AdminDashboardTrendDto> GetDashboardTrend(
        ISender sender,
        [AsParameters] GetAdminDashboardTrendQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<AdminDashboardDistributionsDto> GetDashboardDistributions(ISender sender)
    {
        return await sender.Send(new GetAdminDashboardDistributionsQuery());
    }
}
