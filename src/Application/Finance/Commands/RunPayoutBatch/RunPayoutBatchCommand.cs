using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Finance.Commands.RunPayoutBatch;

[Authorize(Roles = Roles.Administrator)]
public record RunPayoutBatchCommand : IRequest<Result>;

public class RunPayoutBatchCommandHandler : IRequestHandler<RunPayoutBatchCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly ITaxCalculatorService _taxCalculatorService;

    public RunPayoutBatchCommandHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        ITaxCalculatorService taxCalculatorService)
    {
        _context = context;
        _identityService = identityService;
        _taxCalculatorService = taxCalculatorService;
    }

    public async Task<Result> Handle(RunPayoutBatchCommand request, CancellationToken cancellationToken)
    {
        var thresholdSetting = await _context.SystemSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Key == SettingKey.Payout_MinThresholdUsd, cancellationToken);

        var threshold = 25m;
        if (decimal.TryParse(thresholdSetting?.Value, out var parsed))
            threshold = parsed;

        var eligible = await _context.UserAccountBalances
            .AsNoTracking()
            .Where(b => b.AccountCode == LedgerAccountCode.InstructorNetBalance && b.Balance >= threshold)
            .Select(b => new { b.UserId, b.Balance, b.Currency })
            .ToListAsync(cancellationToken);

        if (eligible.Count == 0)
            return Result.Success(new { Created = 0 }, "No instructors eligible for payout");

        var created = 0;
        foreach (var entry in eligible)
        {
            var user = await _identityService.GetUserById(entry.UserId);
            if (user == null || string.IsNullOrWhiteSpace(user.Bank)
                || string.IsNullOrWhiteSpace(user.BankNumber)
                || string.IsNullOrWhiteSpace(user.BankAccountHolder))
                continue;

            var wallet = await _context.InstructorWallets
                .FirstOrDefaultAsync(w => w.InstructorId == entry.UserId, cancellationToken);

            if (wallet == null)
                continue;

            var alreadyPending = await _context.WithdrawalRequests
                .AnyAsync(w => w.InstructorWalletId == wallet.Id
                    && w.Status == InstructorWalletTransactionStatus.Processing, cancellationToken);

            if (alreadyPending)
                continue;

            var taxProfile = await _context.TaxProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.InstructorId == entry.UserId, cancellationToken);

            var withholdingResult = await _taxCalculatorService
                .CalculateWithholdingAsync(entry.UserId, entry.Balance, cancellationToken);

            var withholdingAmount = Math.Round(withholdingResult.TaxAmount, 2, MidpointRounding.ToEven);
            var netAmount = Math.Round(Math.Max(0m, entry.Balance - withholdingAmount), 2, MidpointRounding.ToEven);

            if (netAmount <= 0m)
                continue;

            _context.WithdrawalRequests.Add(new WithdrawalRequest
            {
                InstructorWallet = wallet,
                Amount = Math.Round(entry.Balance, 2),
                WithholdingRate = withholdingResult.Rate,
                WithholdingAmount = withholdingAmount,
                NetAmount = netAmount,
                TaxCountryCode = taxProfile?.TaxCountryCode,
                Currency = string.IsNullOrWhiteSpace(entry.Currency) ? "USD" : entry.Currency,
                Bank = user.Bank,
                BankNumber = user.BankNumber,
                BankAccountHolder = user.BankAccountHolder,
                Status = InstructorWalletTransactionStatus.Processing
            });

            created++;
        }

        if (created > 0)
            await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new { Created = created },
            $"Payout batch completed: {created} withdrawal request(s) created");
    }
}
