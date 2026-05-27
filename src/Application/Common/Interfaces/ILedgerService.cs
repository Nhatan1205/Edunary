using Edunary.Application.Finance.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Common.Interfaces;

public interface ILedgerService
{
    Task<FinancialTransaction> PostAsync(LedgerPosting posting, CancellationToken ct);
    Task PostBulkAsync(IReadOnlyList<LedgerPosting> postings, CancellationToken ct);
    Task<FinancialTransaction> ReverseAsync(Guid transactionId, string reason, CancellationToken ct);
    Task<decimal> GetUserBalanceAsync(string userId, string accountCode, CancellationToken ct);
    Task<decimal> GetSystemBalanceAsync(string accountCode, DateTimeOffset? asOf, CancellationToken ct);
}
