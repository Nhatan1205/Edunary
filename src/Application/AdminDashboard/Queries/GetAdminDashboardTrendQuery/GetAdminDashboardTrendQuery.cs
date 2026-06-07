using System.Globalization;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.AdminDashboard.Queries.GetAdminDashboardTrendQuery;

public record GetAdminDashboardTrendQuery : IRequest<AdminDashboardTrendDto>
{
    public string Range { get; init; } = "30d";
}

public class GetAdminDashboardTrendQueryHandler
    : IRequestHandler<GetAdminDashboardTrendQuery, AdminDashboardTrendDto>
{
    private readonly IApplicationDbContext _context;

    public GetAdminDashboardTrendQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    private record RevenuePoint(DateTimeOffset OccurredAt, decimal Amount);

    public async Task<AdminDashboardTrendDto> Handle(
        GetAdminDashboardTrendQuery request, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;

        var (startDate, granularity) = request.Range switch
        {
            "7d"  => (now.AddDays(-7),    "daily"),
            "30d" => (now.AddDays(-30),   "daily"),
            "12m" => (now.AddMonths(-12), "monthly"),
            _     => (now.AddDays(-30),   "daily"),
        };

        var enrollmentDates = await _context.Enrollments
            .Where(e => e.Created >= startDate)
            .Select(e => e.Created)
            .ToListAsync(cancellationToken);

        var revenueRaw = await _context.FinancialEntries
            .Join(_context.FinancialTransactions,
                e => e.TransactionId,
                t => t.Id,
                (e, t) => new { e, t })
            .Where(x => x.t.Status == LedgerTransactionStatus.Posted
                     && x.t.TransactionType == LedgerTransactionType.OrderPaid
                     && x.e.AccountCode == LedgerAccountCode.CashStripe
                     && x.e.Side == EntrySide.Debit
                     && x.t.OccurredAt >= startDate)
            .Select(x => new { OccurredAt = x.t.OccurredAt, Amount = x.e.Amount })
            .ToListAsync(cancellationToken);

        var revenuePoints = revenueRaw
            .Select(r => new RevenuePoint(r.OccurredAt, r.Amount))
            .ToList();

        return granularity == "monthly"
            ? BuildMonthly(enrollmentDates, revenuePoints, request.Range, startDate, now)
            : BuildDaily(enrollmentDates, revenuePoints, request.Range, startDate, now);
    }

    private static AdminDashboardTrendDto BuildDaily(
        List<DateTimeOffset> enrollments,
        List<RevenuePoint> revenue,
        string range,
        DateTimeOffset startDate,
        DateTimeOffset now)
    {
        var enrollByDay = enrollments
            .GroupBy(d => d.DateTime.Date)
            .ToDictionary(g => g.Key, g => g.Count());

        var revenueByDay = revenue
            .GroupBy(r => r.OccurredAt.DateTime.Date)
            .ToDictionary(g => g.Key, g => g.Sum(r => r.Amount));

        var dto    = new AdminDashboardTrendDto { Period = range };
        var cursor = startDate.DateTime.Date;

        while (cursor <= now.Date)
        {
            dto.Labels.Add(cursor.ToString("MMM d", CultureInfo.InvariantCulture));
            dto.Enrollments.Add(enrollByDay.TryGetValue(cursor, out var ec) ? ec : 0);
            dto.Revenue.Add(revenueByDay.TryGetValue(cursor, out var rv) ? rv : 0m);
            cursor = cursor.AddDays(1);
        }

        return dto;
    }

    private static AdminDashboardTrendDto BuildMonthly(
        List<DateTimeOffset> enrollments,
        List<RevenuePoint> revenue,
        string range,
        DateTimeOffset startDate,
        DateTimeOffset now)
    {
        var enrollByMonth = enrollments
            .GroupBy(d => (d.Year, d.Month))
            .ToDictionary(g => g.Key, g => g.Count());

        var revenueByMonth = revenue
            .GroupBy(r => (r.OccurredAt.Year, r.OccurredAt.Month))
            .ToDictionary(g => g.Key, g => g.Sum(r => r.Amount));

        var dto    = new AdminDashboardTrendDto { Period = range };
        var cursor = new DateTime(startDate.Year, startDate.Month, 1);
        var end    = new DateTime(now.Year, now.Month, 1);

        while (cursor <= end)
        {
            var key = (cursor.Year, cursor.Month);
            dto.Labels.Add(cursor.ToString("MMM yy", CultureInfo.InvariantCulture));
            dto.Enrollments.Add(enrollByMonth.TryGetValue(key, out var ec) ? ec : 0);
            dto.Revenue.Add(revenueByMonth.TryGetValue(key, out var rv) ? rv : 0m);
            cursor = cursor.AddMonths(1);
        }

        return dto;
    }
}
