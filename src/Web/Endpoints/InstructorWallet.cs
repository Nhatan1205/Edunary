using Edunary.Application.Common.Models;
using Edunary.Application.InstructorWallets.Commands.ApproveWithdrawalRequest;
using Edunary.Application.InstructorWallets.Commands.CancelWithdrawalRequest;
using Edunary.Application.InstructorWallets.Commands.WithdrawFromInstructorWallet;
using Edunary.Application.InstructorWallets.Queries.GetInstructorWallet;
using Edunary.Application.InstructorWallets.Queries.GetInstructorWalletTransactions;
using Edunary.Application.InstructorWallets.Queries.GetWithdrawalRequestsForAdmin;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class InstructorWallet : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetWallet)
            .MapGet(GetTransactions, "transactions")
            .MapGet(GetAdminWithdrawalRequests, "admin/withdrawal-requests")
            .MapPost(Withdraw, "withdraw")
            .MapPost(ApproveWithdrawal, "withdrawals/{id:int}/approve")
            .MapPost(CancelWithdrawal, "withdrawals/{id:int}/cancel");
    }

    public async Task<InstructorWalletDto> GetWallet(ISender sender)
    {
        return await sender.Send(new GetInstructorWalletQuery());
    }

    public async Task<PaginatedList<InstructorWalletTransactionDto>> GetTransactions(
        ISender sender,
        [AsParameters] GetInstructorWalletTransactionsQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<PaginatedList<AdminWithdrawalRequestDto>> GetAdminWithdrawalRequests(
        ISender sender,
        [AsParameters] GetWithdrawalRequestsForAdminQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<IResult> Withdraw(ISender sender, WithdrawFromInstructorWalletCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> ApproveWithdrawal(ISender sender, int id)
    {
        var result = await sender.Send(new ApproveWithdrawalRequestCommand { RequestId = id });
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> CancelWithdrawal(ISender sender, int id)
    {
        var result = await sender.Send(new CancelWithdrawalRequestCommand { RequestId = id });
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}
