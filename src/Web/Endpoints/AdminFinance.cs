using Edunary.Application.Common.Models;
using Edunary.Application.Finance.Commands.RunPayoutBatch;
using Edunary.Application.Finance.Queries.GetEligiblePayouts;
using Edunary.Application.Finance.Queries.GetFinanceLedger;
using Edunary.Application.Finance.Queries.GetFinanceSummary;
using Edunary.Application.Finance.Queries.GetTaxReport;
using Edunary.Application.Finance.Queries.GetTaxSettings;
using Edunary.Application.Finance.Payouts;
using Edunary.Application.Finance.TaxRegions.Commands;
using Edunary.Application.Finance.TaxRegions.Queries;
using Edunary.Application.SystemSettings.Commands.UpdateSystemSettingsCommand;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Edunary.Web.Endpoints;

public class AdminFinance : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetSummary, "summary")
            .MapGet(GetLedger, "ledger")
            .MapGet(GetTaxReport, "tax-report")
            .MapGet(GetPayoutSettings, "payouts/settings")
            .MapPut(UpdatePayoutSettings, "payouts/settings")
            .MapGet(GetEligiblePayouts, "payouts/eligible")
            .MapPost(RunPayoutBatch, "payouts/run-batch")
            .MapGet(GetTaxRegions, "tax-regions")
            .MapPut(UpsertTaxRegion, "tax-regions")
            .MapDelete(DeleteTaxRegion, "tax-regions/{countryCode}")
            .MapGet(GetTaxSettings, "tax-settings")
            .MapPut(UpdateTaxSettings, "tax-settings");
    }

    public async Task<FinanceSummaryDto> GetSummary(
        ISender sender,
        [AsParameters] GetFinanceSummaryQuery query)
        => await sender.Send(query);

    public async Task<PaginatedList<FinanceLedgerEntryDto>> GetLedger(
        ISender sender,
        [AsParameters] GetFinanceLedgerQuery query)
        => await sender.Send(query);

    public async Task<TaxReportDto> GetTaxReport(
        ISender sender,
        string period = null)
        => await sender.Send(new GetTaxReportQuery { Period = period });

    public async Task<List<EligiblePayoutDto>> GetEligiblePayouts(
        ISender sender,
        DateTimeOffset? asOf = null)
        => await sender.Send(new GetEligiblePayoutsQuery());

    public async Task<PayoutSettingsDto> GetPayoutSettings(ISender sender)
        => await sender.Send(new GetPayoutSettingsQuery());

    public async Task<Results<Ok<Result>, BadRequest<Result>>> UpdatePayoutSettings(ISender sender, UpdatePayoutSettingsCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? TypedResults.Ok(result) : TypedResults.BadRequest(result);
    }

    public async Task<Results<Ok<Result>, BadRequest<Result>>> RunPayoutBatch(ISender sender)
    {
        var result = await sender.Send(new RunPayoutBatchCommand());
        return result.Succeeded ? TypedResults.Ok(result) : TypedResults.BadRequest(result);
    }

    public async Task<List<TaxRegionDto>> GetTaxRegions(ISender sender)
        => await sender.Send(new GetTaxRegionsQuery());

    public async Task<IResult> UpsertTaxRegion(ISender sender, UpsertTaxRegionCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result.Errors);
    }

    public async Task<IResult> DeleteTaxRegion(ISender sender, string countryCode)
    {
        var result = await sender.Send(new DeleteTaxRegionCommand(countryCode));
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result.Errors);
    }

    public async Task<TaxSettingsDto> GetTaxSettings(ISender sender)
        => await sender.Send(new GetTaxSettingsQuery());

    public async Task<IResult> UpdateTaxSettings(ISender sender, UpdateTaxSettingsRequest request)
    {
        var command = new UpdateSystemSettingsCommand
        {
            Settings = new List<UpdateSettingItem>()
        };

        if (request.DefaultVatRate.HasValue)
            command.Settings.Add(new UpdateSettingItem { Key = "Tax_DefaultVatRate", Value = request.DefaultVatRate.Value.ToString() });

        if (request.DefaultWithholdingRate.HasValue)
            command.Settings.Add(new UpdateSettingItem { Key = "Tax_DefaultWithholdingRate", Value = request.DefaultWithholdingRate.Value.ToString() });

        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}

public class UpdateTaxSettingsRequest
{
    public decimal? DefaultVatRate { get; set; }
    public decimal? DefaultWithholdingRate { get; set; }
}
