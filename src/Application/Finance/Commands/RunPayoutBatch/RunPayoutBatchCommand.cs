using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Application.Finance.Payouts;

namespace Edunary.Application.Finance.Commands.RunPayoutBatch;

public record RunPayoutBatchCommand : IRequest<Result>;

public class RunPayoutBatchCommandHandler : IRequestHandler<RunPayoutBatchCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly PayoutEligibilityService _payoutEligibilityService;
    private readonly IWithdrawalPayoutLedgerService _withdrawalPayoutLedgerService;

    public RunPayoutBatchCommandHandler(
        IApplicationDbContext context,
        PayoutEligibilityService payoutEligibilityService,
        IWithdrawalPayoutLedgerService withdrawalPayoutLedgerService)
    {
        _context = context;
        _payoutEligibilityService = payoutEligibilityService;
        _withdrawalPayoutLedgerService = withdrawalPayoutLedgerService;
    }

    public async Task<Result> Handle(RunPayoutBatchCommand request, CancellationToken cancellationToken)
    {
        var threshold = await _payoutEligibilityService.GetMinimumThresholdUsdAsync(cancellationToken);
        var candidates = await _payoutEligibilityService.GetCandidatesAsync(cancellationToken);
        var readyCandidates = candidates.Where(c => c.IsBatchReady).ToList();

        if (candidates.Count == 0)
        {
            return Result.Success(
                new { Created = 0, Candidates = 0, Skipped = 0, Threshold = threshold },
                "No instructors meet the minimum payout threshold");
        }

        if (readyCandidates.Count == 0)
        {
            return Result.Success(
                new { Created = 0, Candidates = candidates.Count, Skipped = candidates.Count, Threshold = threshold },
                "No payout-ready instructors found");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        var created = 0;
        var createdRequests = new List<(WithdrawalRequest Request, string InstructorId)>();

        foreach (var entry in readyCandidates)
        {
            var withdrawalRequest = new WithdrawalRequest
            {
                InstructorWalletId = entry.InstructorWalletId.GetValueOrDefault(),
                Amount = Math.Round(entry.NetBalance, 2),
                WithholdingRate = entry.WithholdingRate,
                WithholdingAmount = entry.WithholdingAmount,
                NetAmount = entry.EstimatedNetAmount,
                TaxCountryCode = entry.TaxCountryCode,
                Currency = string.IsNullOrWhiteSpace(entry.Currency) ? "USD" : entry.Currency,
                Bank = entry.Bank,
                BankNumber = entry.BankNumber,
                BankAccountHolder = entry.BankAccountHolder
            };

            _context.WithdrawalRequests.Add(withdrawalRequest);
            createdRequests.Add((withdrawalRequest, entry.InstructorId));

            created++;
        }

        if (created > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        foreach (var (withdrawalRequest, instructorId) in createdRequests)
        {
            await _withdrawalPayoutLedgerService.PostInitiatedAsync(withdrawalRequest, instructorId, cancellationToken);
        }

        if (created > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);

        return Result.Success(
            new
            {
                Created = created,
                Candidates = candidates.Count,
                Skipped = candidates.Count - created,
                Threshold = threshold
            },
            $"Payout batch completed: {created} withdrawal request(s) created");
    }
}
