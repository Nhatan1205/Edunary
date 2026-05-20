using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
using Edunary.Domain.Entities;
using Edunary.Application.Finance.Payouts;
using Edunary.Domain.Constants;

namespace Edunary.Application.Finance.Commands.RunPayoutBatch;

[Authorize(Roles = Roles.Administrator)]
public record RunPayoutBatchCommand : IRequest<Result>;

public class RunPayoutBatchCommandHandler : IRequestHandler<RunPayoutBatchCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly PayoutEligibilityService _payoutEligibilityService;

    public RunPayoutBatchCommandHandler(
        IApplicationDbContext context,
        PayoutEligibilityService payoutEligibilityService)
    {
        _context = context;
        _payoutEligibilityService = payoutEligibilityService;
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

        var created = 0;
        foreach (var entry in readyCandidates)
        {
            _context.WithdrawalRequests.Add(new WithdrawalRequest
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
            });

            created++;
        }

        if (created > 0)
            await _context.SaveChangesAsync(cancellationToken);

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
