using System.Globalization;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;

namespace Edunary.Application.Finance.Payouts;

public class PayoutEligibilityService
{
    public const decimal DefaultMinimumThresholdUsd = 25m;

    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly ITaxCalculatorService _taxCalculatorService;

    public PayoutEligibilityService(
        IApplicationDbContext context,
        IIdentityService identityService,
        ITaxCalculatorService taxCalculatorService)
    {
        _context = context;
        _identityService = identityService;
        _taxCalculatorService = taxCalculatorService;
    }

    public async Task<decimal> GetMinimumThresholdUsdAsync(CancellationToken cancellationToken)
    {
        var thresholdSetting = await _context.SystemSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Key == SettingKey.Payout_MinThresholdUsd, cancellationToken);

        return TryParsePositiveDecimal(thresholdSetting?.Value, out var threshold)
            ? threshold
            : DefaultMinimumThresholdUsd;
    }

    public async Task<List<PayoutEligibilityResult>> GetCandidatesAsync(CancellationToken cancellationToken)
    {
        var threshold = await GetMinimumThresholdUsdAsync(cancellationToken);

        var balances = await _context.UserAccountBalances
            .AsNoTracking()
            .Where(b => b.AccountCode == LedgerAccountCode.InstructorNetBalance && b.Balance >= threshold)
            .Select(b => new { b.UserId, b.Balance, b.Currency })
            .ToListAsync(cancellationToken);

        if (balances.Count == 0)
            return new List<PayoutEligibilityResult>();

        var userIds = balances.Select(b => b.UserId).ToList();

        var wallets = await _context.InstructorWallets
            .AsNoTracking()
            .Where(w => userIds.Contains(w.InstructorId))
            .Select(w => new { w.Id, w.InstructorId })
            .ToListAsync(cancellationToken);

        var walletMap = wallets.ToDictionary(w => w.InstructorId, w => w);
        var walletIds = wallets.Select(w => w.Id).ToList();

        var processingWalletIds = walletIds.Count == 0
            ? new HashSet<int>()
            : (await _context.WithdrawalRequests
                .AsNoTracking()
                .Where(w => walletIds.Contains(w.InstructorWalletId)
                    && w.Status == InstructorWalletTransactionStatus.Processing)
                .Select(w => w.InstructorWalletId)
                .ToListAsync(cancellationToken))
                .ToHashSet();

        var results = new List<PayoutEligibilityResult>();

        foreach (var balance in balances)
        {
            var user = await _identityService.GetUserById(balance.UserId);
            walletMap.TryGetValue(balance.UserId, out var wallet);

            var hasPayoutAccount = user != null
                && !string.IsNullOrWhiteSpace(user.Bank)
                && !string.IsNullOrWhiteSpace(user.BankNumber)
                && !string.IsNullOrWhiteSpace(user.BankAccountHolder);

            var hasInstructorWallet = wallet != null;
            var hasProcessingWithdrawal = wallet != null && processingWalletIds.Contains(wallet.Id);

            var taxProfile = await _context.TaxProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.InstructorId == balance.UserId, cancellationToken);

            var withholdingResult = await _taxCalculatorService
                .CalculateWithholdingAsync(balance.UserId, balance.Balance, cancellationToken);

            var withholdingAmount = Math.Round(withholdingResult.TaxAmount, 2, MidpointRounding.ToEven);
            var estimatedNetAmount = Math.Round(Math.Max(0m, balance.Balance - withholdingAmount), 2, MidpointRounding.ToEven);

            var blockingReasons = new List<string>();

            if (user == null)
                blockingReasons.Add("Instructor account not found");
            else if (!hasPayoutAccount)
                blockingReasons.Add("Missing payout account");

            if (!hasInstructorWallet)
                blockingReasons.Add("Instructor wallet not found");

            if (hasProcessingWithdrawal)
                blockingReasons.Add("Already has a processing withdrawal");

            if (estimatedNetAmount <= 0m)
                blockingReasons.Add("Estimated net payout is zero after withholding");

            results.Add(new PayoutEligibilityResult
            {
                InstructorId = balance.UserId,
                InstructorName = user?.FullName ?? balance.UserId,
                InstructorEmail = user?.Email ?? string.Empty,
                NetBalance = balance.Balance,
                Currency = string.IsNullOrWhiteSpace(balance.Currency) ? "USD" : balance.Currency,
                HasPayoutAccount = hasPayoutAccount,
                HasInstructorWallet = hasInstructorWallet,
                HasProcessingWithdrawal = hasProcessingWithdrawal,
                WithholdingRate = withholdingResult.Rate,
                WithholdingAmount = withholdingAmount,
                EstimatedNetAmount = estimatedNetAmount,
                IsBatchReady = blockingReasons.Count == 0,
                BlockingReasons = blockingReasons,
                InstructorWalletId = wallet?.Id,
                Bank = user?.Bank,
                BankNumber = user?.BankNumber,
                BankAccountHolder = user?.BankAccountHolder,
                TaxCountryCode = taxProfile?.TaxCountryCode
            });
        }

        return results
            .OrderByDescending(r => r.IsBatchReady)
            .ThenByDescending(r => r.NetBalance)
            .ToList();
    }

    public static bool TryParsePositiveDecimal(string value, out decimal result)
    {
        return decimal.TryParse(value, NumberStyles.Number, CultureInfo.InvariantCulture, out result)
            && result > 0m;
    }
}
