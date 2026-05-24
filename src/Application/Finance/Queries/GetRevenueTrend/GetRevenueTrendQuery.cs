using System.Globalization;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Finance.Queries.GetRevenueTrend;

public record GetRevenueTrendQuery : IRequest<RevenueTrendDto>
{
    public string Range { get; init; } = "30d";
}

public class GetRevenueTrendQueryHandler : IRequestHandler<GetRevenueTrendQuery, RevenueTrendDto>
{
    private readonly IApplicationDbContext _context;

    public GetRevenueTrendQueryHandler(IApplicationDbContext context) => _context = context;

    private record RawEntry(DateTimeOffset OccurredAt, string AccountCode, EntrySide Side, decimal Amount);

    public async Task<RevenueTrendDto> Handle(GetRevenueTrendQuery request, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;

        var (startDate, granularity) = request.Range switch
        {
            "7d"  => (now.AddDays(-7),    "daily"),
            "30d" => (now.AddDays(-30),   "daily"),
            "3m"  => (now.AddMonths(-3),  "weekly"),
            "12m" => (now.AddMonths(-12), "monthly"),
            _     => (now.AddDays(-30),   "daily"),
        };

        var rawAnon = await _context.FinancialEntries
            .Join(_context.FinancialTransactions,
                e => e.TransactionId,
                t => t.Id,
                (e, t) => new { e, t })
            .Where(x => x.t.Status == LedgerTransactionStatus.Posted
                     && x.t.TransactionType == LedgerTransactionType.OrderPaid
                     && x.t.OccurredAt >= startDate
                     && (x.e.AccountCode == LedgerAccountCode.CashStripe
                         || x.e.AccountCode == LedgerAccountCode.PlatformRevenue))
            .Select(x => new
            {
                OccurredAt  = x.t.OccurredAt,
                AccountCode = x.e.AccountCode,
                Side        = x.e.Side,
                Amount      = x.e.Amount,
            })
            .ToListAsync(cancellationToken);

        var raw = rawAnon.Select(r => new RawEntry(r.OccurredAt, r.AccountCode, r.Side, r.Amount))
                         .ToList();

        return granularity switch
        {
            "monthly" => BuildMonthly(raw, request.Range, startDate, now),
            "weekly"  => BuildWeekly(raw, request.Range, startDate, now),
            _         => BuildDaily(raw, request.Range, startDate, now),
        };
    }

    private static RevenueTrendDto BuildMonthly(
        IReadOnlyList<RawEntry> raw, string range, DateTimeOffset startDate, DateTimeOffset now)
    {
        var groups = raw.GroupBy(r => (r.OccurredAt.Year, r.OccurredAt.Month))
            .ToDictionary(g => g.Key, Aggregate);

        var dto = new RevenueTrendDto { Period = range };
        var cursor = new DateTime(startDate.Year, startDate.Month, 1);
        var end    = new DateTime(now.Year, now.Month, 1);

        while (cursor <= end)
        {
            groups.TryGetValue((cursor.Year, cursor.Month), out var data);
            dto.Labels.Add(cursor.ToString("MMM yy"));
            dto.GrossSales.Add(data.GrossSales);
            dto.PlatformRevenue.Add(data.PlatformRevenue);
            dto.OrderCount.Add(data.OrderCount);
            cursor = cursor.AddMonths(1);
        }

        return dto;
    }

    private static RevenueTrendDto BuildWeekly(
        IReadOnlyList<RawEntry> raw, string range, DateTimeOffset startDate, DateTimeOffset now)
    {
        var groups = raw.GroupBy(r =>
            {
                var d = r.OccurredAt.DateTime.Date;
                return (ISOWeek.GetYear(d), ISOWeek.GetWeekOfYear(d));
            })
            .ToDictionary(g => g.Key, Aggregate);

        var dto    = new RevenueTrendDto { Period = range };
        var cursor = startDate.DateTime.Date;

        while (cursor.DayOfWeek != DayOfWeek.Monday)
            cursor = cursor.AddDays(-1);

        while (cursor <= now.Date)
        {
            var key = (ISOWeek.GetYear(cursor), ISOWeek.GetWeekOfYear(cursor));
            groups.TryGetValue(key, out var data);
            dto.Labels.Add(cursor.ToString("MMM d"));
            dto.GrossSales.Add(data.GrossSales);
            dto.PlatformRevenue.Add(data.PlatformRevenue);
            dto.OrderCount.Add(data.OrderCount);
            cursor = cursor.AddDays(7);
        }

        return dto;
    }

    private static RevenueTrendDto BuildDaily(
        IReadOnlyList<RawEntry> raw, string range, DateTimeOffset startDate, DateTimeOffset now)
    {
        var groups = raw.GroupBy(r => r.OccurredAt.DateTime.Date)
            .ToDictionary(g => g.Key, Aggregate);

        var dto    = new RevenueTrendDto { Period = range };
        var cursor = startDate.DateTime.Date;

        while (cursor <= now.Date)
        {
            groups.TryGetValue(cursor, out var data);
            dto.Labels.Add(cursor.ToString("MMM d"));
            dto.GrossSales.Add(data.GrossSales);
            dto.PlatformRevenue.Add(data.PlatformRevenue);
            dto.OrderCount.Add(data.OrderCount);
            cursor = cursor.AddDays(1);
        }

        return dto;
    }

    private static (decimal GrossSales, decimal PlatformRevenue, int OrderCount) Aggregate(
        IEnumerable<RawEntry> entries)
    {
        var list = entries.ToList();
        return (
            GrossSales: list.Where(r => r.AccountCode == LedgerAccountCode.CashStripe
                                     && r.Side == EntrySide.Debit)
                            .Sum(r => r.Amount),
            PlatformRevenue: list.Where(r => r.AccountCode == LedgerAccountCode.PlatformRevenue
                                          && r.Side == EntrySide.Credit)
                                 .Sum(r => r.Amount),
            OrderCount: list.Count(r => r.AccountCode == LedgerAccountCode.CashStripe
                                     && r.Side == EntrySide.Debit)
        );
    }
}
