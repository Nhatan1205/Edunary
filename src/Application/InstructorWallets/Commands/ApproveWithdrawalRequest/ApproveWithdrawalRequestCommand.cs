using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
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

    public ApproveWithdrawalRequestCommandHandler(IApplicationDbContext context)
    {
        _context = context;
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
