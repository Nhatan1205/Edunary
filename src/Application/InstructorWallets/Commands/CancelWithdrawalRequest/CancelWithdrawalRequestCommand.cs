using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.InstructorWallets.Commands.CancelWithdrawalRequest;

public class CancelWithdrawalRequestCommand : IRequest<Result>
{
    public int RequestId { get; init; }
}

public class CancelWithdrawalRequestCommandHandler : IRequestHandler<CancelWithdrawalRequestCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public CancelWithdrawalRequestCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(CancelWithdrawalRequestCommand request, CancellationToken cancellationToken)
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

        // Acquire a row-level lock on the wallet to serialize concurrent Cancel/Approve/Withdraw operations.
        await _context.InstructorWallets
            .Where(w => w.Id == withdrawalRequest.InstructorWalletId)
            .ExecuteUpdateAsync(setters => setters.SetProperty(w => w.Balance, w => w.Balance), cancellationToken);

        // Re-read status under the lock to guard against a concurrent Approve flipping it between our read and write.
        var currentStatus = await _context.WithdrawalRequests
            .Where(t => t.Id == request.RequestId)
            .Select(t => t.Status)
            .SingleAsync(cancellationToken);

        if (currentStatus != InstructorWalletTransactionStatus.Processing)
        {
            return Result.Failure("Withdrawal request is not in processing state");
        }

        withdrawalRequest.Status = InstructorWalletTransactionStatus.Cancelled;

        await _context.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return Result.Success(new
        {
            withdrawalRequest.Status
        }, "Withdrawal request cancelled");
    }
}
