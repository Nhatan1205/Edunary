using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.InstructorReports.Queries.GetInstructorReport;

public class InstructorReportService
{
    private readonly IApplicationDbContext _context;
    private readonly IApplicationDbContextFactory _contextFactory;

    public InstructorReportService(IApplicationDbContext context, IApplicationDbContextFactory contextFactory)
    {
        _context = context;
        _contextFactory = contextFactory;
    }

    public async Task<InstructorReportDto> BuildAsync(
        string userId,
        DateTimeOffset? from,
        DateTimeOffset? to,
        int? courseId,
        CancellationToken cancellationToken)
    {
        var accessibleCoursesQuery = _context.Courses
            .AsNoTracking()
            .Where(c => c.CreatedBy == userId ||
                        c.Collaborators.Any(cc =>
                            cc.UserId == userId &&
                            cc.InviteStatus == CollaboratorInviteStatus.Accepted &&
                            cc.Permissions.HasFlag(CoursePermission.RevenueReport)));

        if (courseId.HasValue)
        {
            accessibleCoursesQuery = accessibleCoursesQuery.Where(c => c.Id == courseId.Value);
        }

        var accessibleCourseIds = await accessibleCoursesQuery
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);

        if (accessibleCourseIds.Count == 0)
        {
            return EmptyReport();
        }

        var (fromInclusive, toExclusive, aggregation) = InstructorReportTrendBuilder.ResolveRange(from, to);

        await using var scope1 = await _contextFactory.CreateScopedContextAsync(cancellationToken);
        await using var scope2 = await _contextFactory.CreateScopedContextAsync(cancellationToken);
        await using var scope3 = await _contextFactory.CreateScopedContextAsync(cancellationToken);
        await using var scope4 = await _contextFactory.CreateScopedContextAsync(cancellationToken);

        var grossRevenueQuery = scope1.Context.OrderItems
            .AsNoTracking()
            .Where(oi =>
                accessibleCourseIds.Contains(oi.CourseId) &&
                oi.Order.Status == OrderStatus.Completed &&
                oi.Order.CompletedDate.HasValue &&
                oi.Order.CompletedDate.Value >= fromInclusive &&
                oi.Order.CompletedDate.Value < toExclusive);

        var walletEarningsQuery = scope2.Context.InstructorWalletTransactions
            .AsNoTracking()
            .Where(t =>
                t.InstructorWallet.InstructorId == userId &&
                accessibleCourseIds.Contains(t.CourseId) &&
                t.Created >= fromInclusive &&
                t.Created < toExclusive);

        var enrollmentQuery = scope3.Context.Enrollments
            .AsNoTracking()
            .Where(e =>
                accessibleCourseIds.Contains(e.CourseId) &&
                e.Created >= fromInclusive &&
                e.Created < toExclusive);

        var ratingQuery = scope4.Context.RatingCourses
            .AsNoTracking()
            .Where(r =>
                accessibleCourseIds.Contains(r.CourseId) &&
                r.Created >= fromInclusive &&
                r.Created < toExclusive);

        var grossRevenueTask = InstructorReportTrendBuilder.BuildGrossRevenueTrendAsync(grossRevenueQuery, fromInclusive, toExclusive, aggregation, cancellationToken);
        var walletEarningsTask = InstructorReportTrendBuilder.BuildWalletEarningsTrendAsync(walletEarningsQuery, fromInclusive, toExclusive, aggregation, cancellationToken);
        var enrollmentTask = InstructorReportTrendBuilder.BuildEnrollmentTrendAsync(enrollmentQuery, fromInclusive, toExclusive, aggregation, cancellationToken);
        var ratingTask = InstructorReportTrendBuilder.BuildRatingTrendsAsync(ratingQuery, fromInclusive, toExclusive, aggregation, cancellationToken);

        await Task.WhenAll(grossRevenueTask, walletEarningsTask, enrollmentTask, ratingTask);

        var grossRevenueData = grossRevenueTask.Result;
        var walletEarningsData = walletEarningsTask.Result;
        var enrollmentData = enrollmentTask.Result;
        var ratingTrends = ratingTask.Result;

        var grossRevenueTotal = grossRevenueData.Sum(x => x.Value);
        var walletEarningsTotal = walletEarningsData.Sum(x => x.Value);
        var totalEnrollments = (int)enrollmentData.Sum(x => x.Value);
        var totalRatings = ratingTrends.TotalRatings;
        var averageRating = ratingTrends.AverageRating;

        return new InstructorReportDto
        {
            HasAccess = true,
            Summary = new InstructorReportSummaryDto
            {
                GrossRevenue = grossRevenueTotal,
                WalletEarnings = walletEarningsTotal,
                TotalEnrollments = totalEnrollments,
                AverageRating = averageRating,
                TotalRatings = totalRatings,
            },
            Revenue = new InstructorRevenueTrendDto
            {
                AggregationLevel = aggregation,
                Data = grossRevenueData
                    .Zip(walletEarningsData, (gross, wallet) => new InstructorRevenuePointDto
                    {
                        Date = gross.Date,
                        GrossRevenue = gross.Value,
                        WalletEarnings = wallet.Value,
                    })
                    .ToList(),
            },
            Enrollment = new InstructorTrendDto
            {
                AggregationLevel = aggregation,
                Data = enrollmentData,
                Total = totalEnrollments,
            },
            Rating = new InstructorTrendDto
            {
                AggregationLevel = aggregation,
                Data = ratingTrends.AverageRatingData,
                Total = (decimal)averageRating,
            },
            RatingCount = new InstructorTrendDto
            {
                AggregationLevel = aggregation,
                Data = ratingTrends.RatingCountData,
                Total = totalRatings,
            },
        };
    }

    public static InstructorReportDto EmptyReport()
    {
        return new InstructorReportDto
        {
            HasAccess = false,
            Summary = new InstructorReportSummaryDto(),
            Revenue = new InstructorRevenueTrendDto(),
            Enrollment = new InstructorTrendDto(),
            Rating = new InstructorTrendDto(),
            RatingCount = new InstructorTrendDto(),
        };
    }
}
