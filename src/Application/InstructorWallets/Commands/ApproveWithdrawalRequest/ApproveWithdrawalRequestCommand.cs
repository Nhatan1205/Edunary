using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.InstructorWallets.Commands.ApproveWithdrawalRequest;

public class ApproveWithdrawalRequestCommand : IRequest<Result>
{
    public int RequestId { get; init; }
}

public class ApproveWithdrawalRequestCommandHandler : IRequestHandler<ApproveWithdrawalRequestCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IWithdrawalPayoutLedgerService _withdrawalPayoutLedgerService;

    public ApproveWithdrawalRequestCommandHandler(
        IApplicationDbContext context,
        IWithdrawalPayoutLedgerService withdrawalPayoutLedgerService)
    {
        _context = context;
        _withdrawalPayoutLedgerService = withdrawalPayoutLedgerService;
    }

    public async Task<Result> Handle(ApproveWithdrawalRequestCommand request, CancellationToken cancellationToken)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        var withdrawalRequest = await _context.WithdrawalRequests
            .Include(t => t.InstructorWallet)
            .SingleOrDefaultAsync(t => t.Id == request.RequestId, cancellationToken);

        if (withdrawalRequest == null)
        {
            return Result.Failure("Withdrawal request not found");
        }

        if (withdrawalRequest.Status != InstructorWalletTransactionStatus.Processing)
        {
            return Result.Failure("Withdrawal request is not in processing state");
        }

        // Acquire a row-level lock on the wallet to serialize concurrent Approve/Withdraw/Cancel operations.
        await _context.InstructorWallets
            .Where(w => w.Id == withdrawalRequest.InstructorWalletId)
            .ExecuteUpdateAsync(setters => setters.SetProperty(w => w.Balance, w => w.Balance), cancellationToken);

        // Re-read the withdrawal request status after lock acquisition to avoid acting on stale tracked state.
        var currentWithdrawalRequestStatus = await _context.WithdrawalRequests
            .AsNoTracking()
            .Where(t => t.Id == request.RequestId)
            .Select(t => t.Status)
            .SingleAsync(cancellationToken);
        if (currentWithdrawalRequestStatus != InstructorWalletTransactionStatus.Processing)
        {
            return Result.Failure("Withdrawal request is not in processing state");
        }

        var initiatedTransactionId = await _withdrawalPayoutLedgerService
            .GetInitiatedTransactionIdAsync(request.RequestId, cancellationToken);
        if (!initiatedTransactionId.HasValue)
        {
            return Result.Failure("Withdrawal initiation ledger not found");
        }

        // Re-read the wallet after lock acquisition to ensure balance checks use current persisted values.
        var wallet = await _context.InstructorWallets
            .SingleAsync(w => w.Id == withdrawalRequest.InstructorWalletId, cancellationToken);

        withdrawalRequest.InstructorWallet = wallet;

        if (wallet.Balance < withdrawalRequest.Amount)
        {
            return Result.Failure("Insufficient wallet balance");
        }

        wallet.Balance -= withdrawalRequest.Amount;
        wallet.TotalWithdrawn += withdrawalRequest.Amount;
        withdrawalRequest.Status = InstructorWalletTransactionStatus.Succeeded;

        var instructorId = wallet.InstructorId;
        if (!string.IsNullOrWhiteSpace(instructorId))
        {
            await _withdrawalPayoutLedgerService.PostCompletedAsync(
                withdrawalRequest,
                instructorId,
                cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return Result.Success(new
        {
            wallet.Balance,
            wallet.TotalWithdrawn,
            withdrawalRequest.Status
        }, "Withdrawal request approved");
    }
}
