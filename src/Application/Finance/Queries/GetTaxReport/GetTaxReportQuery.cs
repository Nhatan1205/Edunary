using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Finance.Queries.GetTaxReport;

[Authorize(Roles = Roles.Administrator)]
public record GetTaxReportQuery : IRequest<TaxReportDto>
{
    /// <summary>Period in "YYYY-MM" format. Defaults to current month.</summary>
    public string Period { get; init; }
}

public class GetTaxReportQueryHandler : IRequestHandler<GetTaxReportQuery, TaxReportDto>
{
    private readonly IApplicationDbContext _context;

    public GetTaxReportQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<TaxReportDto> Handle(GetTaxReportQuery request, CancellationToken cancellationToken)
    {
        var period = request.Period ?? DateTimeOffset.UtcNow.ToString("yyyy-MM");

        DateTimeOffset from, to;
        if (DateTimeOffset.TryParseExact(period + "-01", "yyyy-MM-dd", null,
            System.Globalization.DateTimeStyles.None, out var parsed))
        {
            from = parsed;
            to = from.AddMonths(1);
        }
        else
        {
            from = new DateTimeOffset(DateTimeOffset.UtcNow.Year, DateTimeOffset.UtcNow.Month, 1, 0, 0, 0, TimeSpan.Zero);
            to = from.AddMonths(1);
        }

        var vatByRegionRaw = await _context.Orders
            .AsNoTracking()
            .Where(o => o.Status == OrderStatus.Completed
                && o.CompletedDate.HasValue
                && o.CompletedDate.Value >= from.UtcDateTime
                && o.CompletedDate.Value < to.UtcDateTime
                && o.VatAmount > 0)
            .GroupBy(o => o.BillingCountryCode)
            .Select(g => new { CountryCode = g.Key, Total = g.Sum(o => (double)o.VatAmount), Count = g.Count() })
            .ToListAsync(cancellationToken);

        var vatByRegion = vatByRegionRaw
            .Select(r => new VatByRegionDto
            {
                CountryCode = string.IsNullOrEmpty(r.CountryCode) ? "Unknown" : r.CountryCode,
                VatAmount = Math.Round((decimal)r.Total, 4),
                OrderCount = r.Count
            })
            .ToList();

        var totalWithholding = await _context.FinancialEntries
            .Join(_context.FinancialTransactions,
                e => e.TransactionId,
                t => t.Id,
                (e, t) => new { e, t })
            .Where(x => x.t.Status == LedgerTransactionStatus.Posted
                && x.t.OccurredAt >= from
                && x.t.OccurredAt < to
                && x.e.AccountCode == LedgerAccountCode.IrsWithholdingLiability
                && x.e.Side == EntrySide.Credit)
            .SumAsync(x => (decimal?)x.e.Amount, cancellationToken) ?? 0m;

        return new TaxReportDto
        {
            Period = period,
            VatByRegion = vatByRegion,
            TotalVatCollected = vatByRegion.Sum(r => r.VatAmount),
            TotalWithholdingTax = totalWithholding,
        };
    }
}
