using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.InstructorReports.Queries.GetInstructorReport;

internal static class InstructorReportTrendBuilder
{
    private const string DailyAggregation = "daily";
    private const string MonthlyAggregation = "monthly";

    internal static (DateTimeOffset FromInclusive, DateTimeOffset ToExclusive, string Aggregation) ResolveRange(
        DateTimeOffset? from,
        DateTimeOffset? to)
    {
        var now = DateTimeOffset.UtcNow;
        var start = from ?? now.AddMonths(-12);
        var end = to ?? now;

        var fromInclusive = new DateTimeOffset(start.UtcDateTime.Date, TimeSpan.Zero);
        var toExclusive = new DateTimeOffset(end.UtcDateTime.Date.AddDays(1), TimeSpan.Zero);

        if (toExclusive <= fromInclusive)
        {
            toExclusive = fromInclusive.AddDays(1);
        }

        var aggregation = (toExclusive - fromInclusive).TotalDays <= 90
            ? DailyAggregation
            : MonthlyAggregation;

        return (fromInclusive, toExclusive, aggregation);
    }

    internal static async Task<List<ReportDataPointDto>> BuildGrossRevenueTrendAsync(
        IQueryable<OrderItem> query,
        DateTimeOffset fromInclusive,
        DateTimeOffset toExclusive,
        string aggregation,
        CancellationToken cancellationToken)
    {
        List<TrendGroup> grouped;
        if (aggregation == DailyAggregation)
        {
            grouped = await query
                .GroupBy(oi => oi.Order.CompletedDate!.Value.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Value = g.Sum(x => (decimal)x.Price),
                })
                .Select(x => new TrendGroup(x.Date, x.Value))
                .ToListAsync(cancellationToken);
        }
        else
        {
            grouped = await query
                .GroupBy(oi => new DateTime(oi.Order.CompletedDate!.Value.Year, oi.Order.CompletedDate!.Value.Month, 1))
                .Select(g => new
                {
                    Date = g.Key,
                    Value = g.Sum(x => (decimal)x.Price),
                })
                .Select(x => new TrendGroup(x.Date, x.Value))
                .ToListAsync(cancellationToken);
        }

        return FillBuckets(grouped, fromInclusive, toExclusive, aggregation);
    }

    internal static async Task<List<ReportDataPointDto>> BuildWalletEarningsTrendAsync(
        IQueryable<InstructorWalletTransaction> query,
        DateTimeOffset fromInclusive,
        DateTimeOffset toExclusive,
        string aggregation,
        CancellationToken cancellationToken)
    {
        List<TrendGroup> grouped;
        if (aggregation == DailyAggregation)
        {
            grouped = await query
                .GroupBy(t => t.Created.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Value = g.Sum(x => x.Amount),
                })
                .Select(x => new TrendGroup(x.Date, x.Value))
                .ToListAsync(cancellationToken);
        }
        else
        {
            grouped = await query
                .GroupBy(t => new DateTime(t.Created.Year, t.Created.Month, 1))
                .Select(g => new
                {
                    Date = g.Key,
                    Value = g.Sum(x => x.Amount),
                })
                .Select(x => new TrendGroup(x.Date, x.Value))
                .ToListAsync(cancellationToken);
        }

        return FillBuckets(grouped, fromInclusive, toExclusive, aggregation);
    }

    internal static async Task<List<ReportDataPointDto>> BuildEnrollmentTrendAsync(
        IQueryable<Enrollment> query,
        DateTimeOffset fromInclusive,
        DateTimeOffset toExclusive,
        string aggregation,
        CancellationToken cancellationToken)
    {
        List<TrendGroup> grouped;
        if (aggregation == DailyAggregation)
        {
            grouped = await query
                .GroupBy(e => e.Created.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Value = (decimal)g.Count(),
                })
                .Select(x => new TrendGroup(x.Date, x.Value))
                .ToListAsync(cancellationToken);
        }
        else
        {
            grouped = await query
                .GroupBy(e => new DateTime(e.Created.Year, e.Created.Month, 1))
                .Select(g => new
                {
                    Date = g.Key,
                    Value = (decimal)g.Count(),
                })
                .Select(x => new TrendGroup(x.Date, x.Value))
                .ToListAsync(cancellationToken);
        }

        return FillBuckets(grouped, fromInclusive, toExclusive, aggregation);
    }

    internal static async Task<RatingTrendResult> BuildRatingTrendsAsync(
        IQueryable<RatingCourse> query,
        DateTimeOffset fromInclusive,
        DateTimeOffset toExclusive,
        string aggregation,
        CancellationToken cancellationToken)
    {
        List<RatingTrendGroup> grouped;
        if (aggregation == DailyAggregation)
        {
            grouped = await query
                .GroupBy(r => r.Created.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    AverageRating = g.Average(x => x.Rating),
                    Count = g.Count(),
                })
                .Select(x => new RatingTrendGroup(x.Date, (decimal)x.AverageRating, x.Count))
                .ToListAsync(cancellationToken);
        }
        else
        {
            grouped = await query
                .GroupBy(r => new DateTime(r.Created.Year, r.Created.Month, 1))
                .Select(g => new
                {
                    Date = g.Key,
                    AverageRating = g.Average(x => x.Rating),
                    Count = g.Count(),
                })
                .Select(x => new RatingTrendGroup(x.Date, (decimal)x.AverageRating, x.Count))
                .ToListAsync(cancellationToken);
        }

        var averageRatingData = FillBuckets(
            grouped.Select(x => new TrendGroup(x.Date, x.AverageRating)),
            fromInclusive,
            toExclusive,
            aggregation);
        var ratingCountData = FillBuckets(
            grouped.Select(x => new TrendGroup(x.Date, x.Count)),
            fromInclusive,
            toExclusive,
            aggregation);
        var totalRatings = grouped.Sum(x => x.Count);
        var averageRating = totalRatings > 0
            ? (float)(grouped.Sum(x => x.AverageRating * x.Count) / totalRatings)
            : 0f;

        return new RatingTrendResult
        {
            AverageRatingData = averageRatingData,
            RatingCountData = ratingCountData,
            TotalRatings = totalRatings,
            AverageRating = averageRating,
        };
    }

    private static List<ReportDataPointDto> BuildBuckets(
        DateTimeOffset fromInclusive,
        DateTimeOffset toExclusive,
        string aggregation)
    {
        var buckets = new List<ReportDataPointDto>();

        if (aggregation == DailyAggregation)
        {
            for (var cursor = fromInclusive.UtcDateTime.Date; cursor < toExclusive.UtcDateTime.Date; cursor = cursor.AddDays(1))
            {
                buckets.Add(new ReportDataPointDto { Date = cursor, Value = 0m });
            }

            return buckets;
        }

        var start = new DateTime(fromInclusive.UtcDateTime.Year, fromInclusive.UtcDateTime.Month, 1);
        var lastIncluded = toExclusive.UtcDateTime.AddTicks(-1);
        var end = new DateTime(lastIncluded.Year, lastIncluded.Month, 1);
        for (var cursor = start; cursor <= end; cursor = cursor.AddMonths(1))
        {
            buckets.Add(new ReportDataPointDto { Date = cursor, Value = 0m });
        }

        return buckets;
    }

    private static List<ReportDataPointDto> FillBuckets(
        IEnumerable<TrendGroup> grouped,
        DateTimeOffset fromInclusive,
        DateTimeOffset toExclusive,
        string aggregation)
    {
        var map = grouped.ToDictionary(x => x.Date, x => x.Value);
        var buckets = BuildBuckets(fromInclusive, toExclusive, aggregation);

        foreach (var bucket in buckets)
        {
            if (map.TryGetValue(bucket.Date, out var value))
            {
                bucket.Value = value;
            }
        }

        return buckets;
    }
}

internal sealed record TrendGroup(DateTime Date, decimal Value);
internal sealed record RatingTrendGroup(DateTime Date, decimal AverageRating, int Count);

internal sealed class RatingTrendResult
{
    public List<ReportDataPointDto> AverageRatingData { get; init; } = new();
    public List<ReportDataPointDto> RatingCountData { get; init; } = new();
    public int TotalRatings { get; init; }
    public float AverageRating { get; init; }
}
