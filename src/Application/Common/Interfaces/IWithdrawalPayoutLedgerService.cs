#nullable enable
using Edunary.Domain.Entities;

namespace Edunary.Application.Common.Interfaces;

public interface IWithdrawalPayoutLedgerService
{
    Task<FinancialTransaction> PostInitiatedAsync(
        WithdrawalRequest withdrawalRequest,
        string instructorId,
        CancellationToken cancellationToken);

    Task<FinancialTransaction> PostCompletedAsync(
        WithdrawalRequest withdrawalRequest,
        string instructorId,
        CancellationToken cancellationToken);

    Task<Guid?> GetInitiatedTransactionIdAsync(int withdrawalRequestId, CancellationToken cancellationToken);

    Task<FinancialTransaction?> ReverseInitiatedAsync(
        int withdrawalRequestId,
        string reason,
        CancellationToken cancellationToken);

    Task<int> BackfillProcessingWithdrawalsAsync(CancellationToken cancellationToken);
}
