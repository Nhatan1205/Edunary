using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
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

    public ApproveWithdrawalRequestCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(ApproveWithdrawalRequestCommand request, CancellationToken cancellationToken)
    {
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

        var wallet = withdrawalRequest.InstructorWallet;

        if (wallet.Balance < withdrawalRequest.Amount)
        {
            return Result.Failure("Insufficient wallet balance");
        }

        wallet.Balance -= withdrawalRequest.Amount;
        wallet.TotalWithdrawn += withdrawalRequest.Amount;
        withdrawalRequest.Status = InstructorWalletTransactionStatus.Succeeded;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new
        {
            wallet.Balance,
            wallet.TotalWithdrawn,
            withdrawalRequest.Status
        }, "Withdrawal request approved");
    }
}
