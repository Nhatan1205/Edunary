#nullable enable
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Finance.Models;
using Edunary.Domain.Constants;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Finance.Payouts;

public class WithdrawalPayoutLedgerService : IWithdrawalPayoutLedgerService
{
    private const string WithdrawalReferenceType = "WithdrawalRequest";

    private readonly IApplicationDbContext _context;
    private readonly ILedgerService _ledgerService;

    public WithdrawalPayoutLedgerService(
        IApplicationDbContext context,
        ILedgerService ledgerService)
    {
        _context = context;
        _ledgerService = ledgerService;
    }

    public Task<FinancialTransaction> PostInitiatedAsync(
        WithdrawalRequest withdrawalRequest,
        string instructorId,
        CancellationToken cancellationToken)
    {
        return _ledgerService.PostAsync(BuildInitiatedPosting(withdrawalRequest, instructorId), cancellationToken);
    }

    private static LedgerPosting BuildInitiatedPosting(WithdrawalRequest withdrawalRequest, string instructorId)
    {
        var description = $"Withdrawal {withdrawalRequest.Id} initiated";

        return new LedgerPosting
        {
            TransactionType = LedgerTransactionType.PayoutInitiated,
            ReferenceType = WithdrawalReferenceType,
            ReferenceId = withdrawalRequest.Id.ToString(),
            Currency = string.IsNullOrWhiteSpace(withdrawalRequest.Currency) ? "USD" : withdrawalRequest.Currency,
            OccurredAt = withdrawalRequest.Created == default
                ? DateTimeOffset.UtcNow
                : withdrawalRequest.Created,
            Entries = new List<LedgerEntryInput>
            {
                new()
                {
                    AccountCode = LedgerAccountCode.InstructorNetBalance,
                    Side = EntrySide.Debit,
                    Amount = withdrawalRequest.Amount,
                    UserId = instructorId,
                    Description = description
                },
                new()
                {
                    AccountCode = LedgerAccountCode.PayoutPending,
                    Side = EntrySide.Credit,
                    Amount = withdrawalRequest.Amount,
                    UserId = instructorId,
                    Description = description
                }
            }
        };
    }

    public Task<FinancialTransaction> PostCompletedAsync(
        WithdrawalRequest withdrawalRequest,
        string instructorId,
        CancellationToken cancellationToken)
    {
        var withholdingAmount = Math.Max(0m, withdrawalRequest.WithholdingAmount);
        var netAmount = withdrawalRequest.NetAmount > 0m
            ? withdrawalRequest.NetAmount
            : Math.Max(0m, withdrawalRequest.Amount - withholdingAmount);
        var description = $"Withdrawal {withdrawalRequest.Id} completed";

        var entries = new List<LedgerEntryInput>
        {
            new()
            {
                AccountCode = LedgerAccountCode.PayoutPending,
                Side = EntrySide.Debit,
                Amount = withdrawalRequest.Amount,
                UserId = instructorId,
                Description = description
            }
        };

        if (withholdingAmount > 0)
        {
            entries.Add(new LedgerEntryInput
            {
                AccountCode = LedgerAccountCode.IrsWithholdingLiability,
                Side = EntrySide.Credit,
                Amount = withholdingAmount,
                Description = description
            });
        }

        if (netAmount > 0)
        {
            entries.Add(new LedgerEntryInput
            {
                AccountCode = LedgerAccountCode.CashStripe,
                Side = EntrySide.Credit,
                Amount = netAmount,
                Description = description
            });
        }

        return _ledgerService.PostAsync(
            new LedgerPosting
            {
                TransactionType = LedgerTransactionType.PayoutCompleted,
                ReferenceType = WithdrawalReferenceType,
                ReferenceId = withdrawalRequest.Id.ToString(),
                Currency = string.IsNullOrWhiteSpace(withdrawalRequest.Currency) ? "USD" : withdrawalRequest.Currency,
                OccurredAt = DateTimeOffset.UtcNow,
                Entries = entries
            },
            cancellationToken);
    }

    public async Task<Guid?> GetInitiatedTransactionIdAsync(int withdrawalRequestId, CancellationToken cancellationToken)
    {
        return await _context.FinancialTransactions
            .AsNoTracking()
            .Where(t =>
                t.TransactionType == LedgerTransactionType.PayoutInitiated &&
                t.ReferenceType == WithdrawalReferenceType &&
                t.ReferenceId == withdrawalRequestId.ToString() &&
                t.Status == LedgerTransactionStatus.Posted)
            .Select(t => (Guid?)t.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<FinancialTransaction?> ReverseInitiatedAsync(
        int withdrawalRequestId,
        string reason,
        CancellationToken cancellationToken)
    {
        var hasInitiatedTransaction = await _context.FinancialTransactions
            .AsNoTracking()
            .AnyAsync(t =>
                t.TransactionType == LedgerTransactionType.PayoutInitiated &&
                t.ReferenceType == WithdrawalReferenceType &&
                t.ReferenceId == withdrawalRequestId.ToString() &&
                t.Status == LedgerTransactionStatus.Posted,
                cancellationToken);

        if (!hasInitiatedTransaction)
        {
            return null;
        }

        var withdrawalRequest = await _context.WithdrawalRequests
            .AsNoTracking()
            .Include(w => w.InstructorWallet)
            .SingleAsync(w => w.Id == withdrawalRequestId, cancellationToken);

        var instructorId = withdrawalRequest.InstructorWallet?.InstructorId;
        if (string.IsNullOrWhiteSpace(instructorId))
        {
            throw new InvalidOperationException(
                $"Withdrawal request {withdrawalRequest.Id} is missing its instructor wallet.");
        }

        var description = $"Withdrawal {withdrawalRequest.Id} cancelled: {reason}";

        return await _ledgerService.PostAsync(
            new LedgerPosting
            {
                TransactionType = LedgerTransactionType.Adjustment,
                ReferenceType = WithdrawalReferenceType,
                ReferenceId = withdrawalRequest.Id.ToString(),
                Currency = string.IsNullOrWhiteSpace(withdrawalRequest.Currency) ? "USD" : withdrawalRequest.Currency,
                OccurredAt = DateTimeOffset.UtcNow,
                Entries = new List<LedgerEntryInput>
                {
                    new()
                    {
                        AccountCode = LedgerAccountCode.InstructorNetBalance,
                        Side = EntrySide.Credit,
                        Amount = withdrawalRequest.Amount,
                        UserId = instructorId,
                        Description = description
                    },
                    new()
                    {
                        AccountCode = LedgerAccountCode.PayoutPending,
                        Side = EntrySide.Debit,
                        Amount = withdrawalRequest.Amount,
                        UserId = instructorId,
                        Description = description
                    }
                }
            },
            cancellationToken);
    }

    public async Task<int> BackfillProcessingWithdrawalsAsync(CancellationToken cancellationToken)
    {
        var processingRequests = await _context.WithdrawalRequests
            .AsNoTracking()
            .Include(w => w.InstructorWallet)
            .Where(w => w.Status == InstructorWalletTransactionStatus.Processing)
            .OrderBy(w => w.Created)
            .ToListAsync(cancellationToken);

        if (processingRequests.Count == 0)
        {
            return 0;
        }

        var requestIds = processingRequests
            .Select(w => w.Id.ToString())
            .ToList();

        var existingInitiatedRequestIds = await _context.FinancialTransactions
            .AsNoTracking()
            .Where(t =>
                t.TransactionType == LedgerTransactionType.PayoutInitiated &&
                t.ReferenceType == WithdrawalReferenceType &&
                requestIds.Contains(t.ReferenceId) &&
                t.Status == LedgerTransactionStatus.Posted)
            .Select(t => t.ReferenceId)
            .ToListAsync(cancellationToken);

        var existingSet = existingInitiatedRequestIds.ToHashSet(StringComparer.Ordinal);
        var pendingPostings = new List<LedgerPosting>();

        foreach (var withdrawalRequest in processingRequests)
        {
            if (existingSet.Contains(withdrawalRequest.Id.ToString())) continue;

            var instructorId = withdrawalRequest.InstructorWallet?.InstructorId;
            if (string.IsNullOrWhiteSpace(instructorId))
            {
                throw new InvalidOperationException(
                    $"Withdrawal request {withdrawalRequest.Id} is missing its instructor wallet.");
            }

            pendingPostings.Add(BuildInitiatedPosting(withdrawalRequest, instructorId));
        }

        if (pendingPostings.Count == 0) return 0;

        await _ledgerService.PostBulkAsync(pendingPostings, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return pendingPostings.Count;
    }
}
