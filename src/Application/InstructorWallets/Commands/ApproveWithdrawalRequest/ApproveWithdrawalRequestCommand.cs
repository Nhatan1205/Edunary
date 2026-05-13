using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
using Edunary.Application.Finance.Models;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.InstructorWallets.Commands.ApproveWithdrawalRequest;

[Authorize(Roles = Roles.Administrator)]
public class ApproveWithdrawalRequestCommand : IRequest<Result>
{
    public int RequestId { get; init; }
}

public class ApproveWithdrawalRequestCommandHandler : IRequestHandler<ApproveWithdrawalRequestCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ILedgerService _ledgerService;

    public ApproveWithdrawalRequestCommandHandler(IApplicationDbContext context, ILedgerService ledgerService)
    {
        _context = context;
        _ledgerService = ledgerService;
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

        // Re-read the wallet after lock acquisition to ensure balance checks use current persisted values.
        var wallet = await _context.InstructorWallets
            .SingleAsync(w => w.Id == withdrawalRequest.InstructorWalletId, cancellationToken);

        withdrawalRequest.InstructorWallet = wallet;

        if (wallet.Balance < withdrawalRequest.Amount)
        {
            return Result.Failure("Insufficient wallet balance");
        }

        var withholdingAmount = Math.Max(0m, withdrawalRequest.WithholdingAmount);
        var netAmount = withdrawalRequest.NetAmount > 0m
            ? withdrawalRequest.NetAmount
            : Math.Max(0m, withdrawalRequest.Amount - withholdingAmount);

        wallet.Balance -= withdrawalRequest.Amount;
        wallet.TotalWithdrawn += withdrawalRequest.Amount;
        withdrawalRequest.Status = InstructorWalletTransactionStatus.Succeeded;

        var instructorId = wallet.InstructorId;
        if (!string.IsNullOrWhiteSpace(instructorId))
        {
            var desc = $"Withdrawal {withdrawalRequest.Id} (Instructor {instructorId})";
            var entries = new List<LedgerEntryInput>
            {
                new LedgerEntryInput
                {
                    AccountCode = LedgerAccountCode.InstructorNetBalance,
                    Side = EntrySide.Debit,
                    Amount = withdrawalRequest.Amount,
                    UserId = instructorId,
                    Description = desc
                }
            };

            if (withholdingAmount > 0)
            {
                entries.Add(new LedgerEntryInput
                {
                    AccountCode = LedgerAccountCode.IrsWithholdingLiability,
                    Side = EntrySide.Credit,
                    Amount = withholdingAmount,
                    Description = desc
                });
            }

            if (netAmount > 0)
            {
                entries.Add(new LedgerEntryInput
                {
                    AccountCode = LedgerAccountCode.CashStripe,
                    Side = EntrySide.Credit,
                    Amount = netAmount,
                    Description = desc
                });
            }

            await _ledgerService.PostAsync(new LedgerPosting
            {
                TransactionType = LedgerTransactionType.PayoutCompleted,
                ReferenceType = "WithdrawalRequest",
                ReferenceId = withdrawalRequest.Id.ToString(),
                Currency = withdrawalRequest.Currency,
                OccurredAt = DateTimeOffset.UtcNow,
                Entries = entries
            }, cancellationToken);
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
