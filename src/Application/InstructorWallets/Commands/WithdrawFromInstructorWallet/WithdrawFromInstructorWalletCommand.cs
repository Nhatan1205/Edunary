using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.InstructorWallets.Commands.WithdrawFromInstructorWallet;

public class WithdrawFromInstructorWalletCommand : IRequest<Result>
{
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";
}

public class WithdrawFromInstructorWalletCommandHandler : IRequestHandler<WithdrawFromInstructorWalletCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;
    private readonly ITaxCalculatorService _taxCalculatorService;

    public WithdrawFromInstructorWalletCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService,
        ITaxCalculatorService taxCalculatorService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
        _taxCalculatorService = taxCalculatorService;
    }

    public async Task<Result> Handle(WithdrawFromInstructorWalletCommand request, CancellationToken cancellationToken)
    {
        var instructorId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(instructorId))
        {
            return Result.Failure("User not authenticated");
        }

        if (request.Amount <= 0)
        {
            return Result.Failure("Amount must be greater than 0");
        }

        var user = await _identityService.GetUserById(instructorId);

        var hasPayoutAccount =
            !string.IsNullOrWhiteSpace(user?.BankAccountHolder) &&
            !string.IsNullOrWhiteSpace(user?.Bank) &&
            !string.IsNullOrWhiteSpace(user?.BankNumber);

        if (!hasPayoutAccount)
        {
            return Result.Failure("Please update your payout account information first");
        }

        var amount = Math.Round(request.Amount, 2);
        if (amount <= 0)
        {
            return Result.Failure("Amount must be greater than 0");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        var wallet = await _context.InstructorWallets
            .SingleOrDefaultAsync(w => w.InstructorId == instructorId, cancellationToken);

        if (wallet == null)
        {
            return Result.Failure("Wallet not found");
        }

        // Serialize concurrent withdrawal requests for the same wallet by taking a row-level lock.
        // This prevents two near-simultaneous requests from both passing the available-balance check.
        await _context.InstructorWallets
            .Where(w => w.Id == wallet.Id)
            .ExecuteUpdateAsync(setters => setters.SetProperty(w => w.Balance, w => w.Balance), cancellationToken);

        // Refresh the wallet after lock acquisition to ensure balance checks use current persisted values.
        wallet = await _context.InstructorWallets
            .SingleAsync(w => w.Id == wallet.Id, cancellationToken);

        var pendingWithdrawalsAmount = await _context.WithdrawalRequests
            .Where(t => t.InstructorWalletId == wallet.Id
                && t.Status == InstructorWalletTransactionStatus.Processing)
            .SumAsync(t => (decimal?)t.Amount, cancellationToken) ?? 0m;

        var availableToRequest = wallet.Balance - pendingWithdrawalsAmount;

        if (availableToRequest < amount)
        {
            return Result.Failure("Amount exceeds your available balance");
        }

        var taxProfile = await _context.TaxProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.InstructorId == instructorId, cancellationToken);

        var withholdingResult = await _taxCalculatorService
            .CalculateWithholdingAsync(instructorId, amount, cancellationToken);

        var withholdingAmount = Math.Round(withholdingResult.TaxAmount, 2, MidpointRounding.ToEven);
        var netAmount = Math.Round(Math.Max(0m, amount - withholdingAmount), 2, MidpointRounding.ToEven);

        if (netAmount <= 0)
        {
            return Result.Failure("Withdrawal amount is too small after withholding tax");
        }

        var withdrawalRequest = new WithdrawalRequest
        {
            InstructorWallet = wallet,
            Amount = amount,
            WithholdingRate = withholdingResult.Rate,
            WithholdingAmount = withholdingAmount,
            NetAmount = netAmount,
            TaxCountryCode = taxProfile?.TaxCountryCode,
            Currency = request.Currency,
            Bank = user!.Bank!,
            BankNumber = user.BankNumber!,
            BankAccountHolder = user.BankAccountHolder!,
            Status = InstructorWalletTransactionStatus.Processing
        };

        _context.WithdrawalRequests.Add(withdrawalRequest);

        await _context.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return Result.Success(new
        {
            withdrawalRequest.Id,
            withdrawalRequest.Status,
            withdrawalRequest.WithholdingRate,
            withdrawalRequest.WithholdingAmount,
            withdrawalRequest.NetAmount
        }, "Withdrawal request created");
    }
}
