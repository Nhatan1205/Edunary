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
        var withdrawalRequest = await _context.WithdrawalRequests
            .SingleOrDefaultAsync(t => t.Id == request.RequestId, cancellationToken);

        if (withdrawalRequest == null)
        {
            return Result.Failure("Withdrawal request not found");
        }

        if (withdrawalRequest.Status != InstructorWalletTransactionStatus.Processing)
        {
            return Result.Failure("Withdrawal request is not in processing state");
        }

        withdrawalRequest.Status = InstructorWalletTransactionStatus.Cancelled;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new
        {
            withdrawalRequest.Status
        }, "Withdrawal request cancelled");
    }
}
