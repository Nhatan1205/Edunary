using Edunary.Application.Common.Interfaces;
using Edunary.Application.Finance.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Services;

public class LedgerService : ILedgerService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public LedgerService(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<FinancialTransaction> PostAsync(LedgerPosting posting, CancellationToken ct)
    {
        ValidatePosting(posting);

        var debitTotal = posting.Entries
            .Where(e => e.Side == EntrySide.Debit)
            .Sum(e => e.Amount);

        var transaction = new FinancialTransaction
        {
            Id = Guid.NewGuid(),
            TransactionType = posting.TransactionType,
            ReferenceType = posting.ReferenceType,
            ReferenceId = posting.ReferenceId,
            OccurredAt = posting.OccurredAt,
            PostedAt = DateTimeOffset.UtcNow,
            Currency = posting.Currency,
            TotalAmount = debitTotal,
            Status = LedgerTransactionStatus.Posted,
            PostedBy = _currentUserService.UserId
        };

        var entries = posting.Entries.Select((e, index) => new FinancialEntry
        {
            TransactionId = transaction.Id,
            AccountCode = e.AccountCode,
            Side = e.Side,
            Amount = e.Amount,
            UserId = e.UserId,
            Description = e.Description,
            EntryOrder = index
        }).ToList();

        transaction.Entries = entries;
        _context.FinancialTransactions.Add(transaction);

        await UpsertBalancesAsync(posting, ct);

        return transaction;
    }

    public async Task<FinancialTransaction> ReverseAsync(Guid transactionId, string reason, CancellationToken ct)
    {
        var original = await _context.FinancialTransactions
            .Include(t => t.Entries)
            .FirstOrDefaultAsync(t => t.Id == transactionId, ct)
            ?? throw new InvalidOperationException($"Transaction {transactionId} not found");

        if (original.Status == LedgerTransactionStatus.Reversed)
            throw new InvalidOperationException($"Transaction {transactionId} is already reversed");

        original.Status = LedgerTransactionStatus.Reversed;

        var reversalPosting = new LedgerPosting
        {
            TransactionType = original.TransactionType,
            ReferenceType = original.ReferenceType,
            ReferenceId = original.ReferenceId,
            Currency = original.Currency,
            OccurredAt = DateTimeOffset.UtcNow,
            Entries = original.Entries.Select(e => new LedgerEntryInput
            {
                AccountCode = e.AccountCode,
                Side = e.Side == EntrySide.Debit ? EntrySide.Credit : EntrySide.Debit,
                Amount = e.Amount,
                UserId = e.UserId,
                Description = $"Reversal: {reason}"
            }).ToList()
        };

        var reversal = await PostAsync(reversalPosting, ct);
        reversal.ReversalOfId = original.Id;

        return reversal;
    }

    public async Task<decimal> GetUserBalanceAsync(string userId, string accountCode, CancellationToken ct)
    {
        var balance = await _context.UserAccountBalances
            .FirstOrDefaultAsync(b => b.UserId == userId && b.AccountCode == accountCode, ct);
        return balance?.Balance ?? 0m;
    }

    public async Task<decimal> GetSystemBalanceAsync(string accountCode, DateTimeOffset? asOf, CancellationToken ct)
    {
        var query = _context.FinancialEntries
            .Where(e => e.AccountCode == accountCode
                     && e.Transaction.Status == LedgerTransactionStatus.Posted);

        if (asOf.HasValue)
            query = query.Where(e => e.Transaction.PostedAt <= asOf.Value);

        var credits = await query.Where(e => e.Side == EntrySide.Credit).SumAsync(e => e.Amount, ct);
        var debits = await query.Where(e => e.Side == EntrySide.Debit).SumAsync(e => e.Amount, ct);

        return credits - debits;
    }

    private static void ValidatePosting(LedgerPosting posting)
    {
        if (!posting.Entries.Any())
            throw new InvalidOperationException("A ledger posting must have at least one entry");

        var debitTotal = posting.Entries.Where(e => e.Side == EntrySide.Debit).Sum(e => e.Amount);
        var creditTotal = posting.Entries.Where(e => e.Side == EntrySide.Credit).Sum(e => e.Amount);

        if (Math.Abs(debitTotal - creditTotal) > 0.001m)
            throw new InvalidOperationException(
                $"Ledger posting is unbalanced: debits={debitTotal}, credits={creditTotal}");

        foreach (var entry in posting.Entries)
        {
            if (entry.Amount <= 0)
                throw new InvalidOperationException($"Entry amount must be positive (got {entry.Amount})");
        }
    }

    private async Task UpsertBalancesAsync(LedgerPosting posting, CancellationToken ct)
    {
        var userEntries = posting.Entries.Where(e => !string.IsNullOrEmpty(e.UserId)).ToList();
        if (userEntries.Count == 0) return;

        var userIds = userEntries.Select(e => e.UserId!).Distinct().ToList();
        var accountCodes = userEntries.Select(e => e.AccountCode).Distinct().ToList();

        var existing = await _context.UserAccountBalances
            .Where(b => userIds.Contains(b.UserId)
                     && accountCodes.Contains(b.AccountCode)
                     && b.Currency == posting.Currency)
            .ToListAsync(ct);

        var balanceDict = existing.ToDictionary(b => (b.UserId, b.AccountCode));

        // Include entities added in a prior PostAsync call in the same request (not yet saved to DB).
        foreach (var local in _context.UserAccountBalances.Local)
        {
            if (userIds.Contains(local.UserId)
                && accountCodes.Contains(local.AccountCode)
                && local.Currency == posting.Currency)
            {
                balanceDict.TryAdd((local.UserId, local.AccountCode), local);
            }
        }

        foreach (var entry in userEntries)
        {
            var key = (entry.UserId!, entry.AccountCode);

            if (!balanceDict.TryGetValue(key, out var balance))
            {
                balance = new UserAccountBalance
                {
                    UserId = entry.UserId!,
                    AccountCode = entry.AccountCode,
                    Currency = posting.Currency,
                    Balance = 0m
                };
                balanceDict[key] = balance;
                _context.UserAccountBalances.Add(balance);
            }

            balance!.Balance += entry.Side == EntrySide.Credit ? entry.Amount : -entry.Amount;
            balance.LastUpdatedAt = DateTimeOffset.UtcNow;
        }
    }
}
