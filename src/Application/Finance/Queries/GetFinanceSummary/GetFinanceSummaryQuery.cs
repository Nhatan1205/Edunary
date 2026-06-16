using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Edunary.Application.Common.Behaviours;

namespace Edunary.Application.Finance.Queries.GetFinanceSummary;

[ActivityLog(ActivityType.AccessFinanceDashboard, "Access Finance Dashboard")]
public record GetFinanceSummaryQuery : IRequest<FinanceSummaryDto>
{
    public DateTimeOffset? From { get; init; }
    public DateTimeOffset? To { get; init; }
}

public class GetFinanceSummaryQueryHandler : IRequestHandler<GetFinanceSummaryQuery, FinanceSummaryDto>
{
    private readonly IApplicationDbContext _context;

    public GetFinanceSummaryQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<FinanceSummaryDto> Handle(GetFinanceSummaryQuery request, CancellationToken cancellationToken)
    {
        var from = request.From ?? DateTimeOffset.MinValue;
        var to = request.To ?? DateTimeOffset.MaxValue;

        var grouped = await _context.FinancialEntries
            .Join(_context.FinancialTransactions,
                e => e.TransactionId,
                t => t.Id,
                (e, t) => new { e, t })
            .Where(x => x.t.Status == LedgerTransactionStatus.Posted
                && x.t.OccurredAt >= from
                && x.t.OccurredAt <= to)
            .GroupBy(x => new { x.e.AccountCode, x.e.Side })
            .Select(g => new
            {
                g.Key.AccountCode,
                g.Key.Side,
                Total = g.Sum(x => x.e.Amount)
            })
            .ToListAsync(cancellationToken);

        decimal Get(string code, EntrySide side) =>
            grouped.FirstOrDefault(g => g.AccountCode == code && g.Side == side)?.Total ?? 0m;

        var instructorGrossCredits = Get(LedgerAccountCode.InstructorGrossEarnings, EntrySide.Credit);
        var withholdingCredits = Get(LedgerAccountCode.IrsWithholdingLiability, EntrySide.Credit);
        var payoutPendingCredits = Get(LedgerAccountCode.PayoutPending, EntrySide.Credit);
        var payoutPendingDebits = Get(LedgerAccountCode.PayoutPending, EntrySide.Debit);

        return new FinanceSummaryDto
        {
            GrossSales = Get(LedgerAccountCode.CashStripe, EntrySide.Debit),
            VatCollected = Get(LedgerAccountCode.VatLiability, EntrySide.Credit),
            PlatformRevenue = Get(LedgerAccountCode.PlatformRevenue, EntrySide.Credit),
            InstructorGrossEarnings = instructorGrossCredits,
            InstructorNetEarnings = instructorGrossCredits - withholdingCredits,
            WithholdingTax = withholdingCredits,
            PendingPayouts = payoutPendingCredits - payoutPendingDebits,
        };
    }
}
