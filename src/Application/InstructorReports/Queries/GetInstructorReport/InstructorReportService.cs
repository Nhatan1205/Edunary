using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.InstructorReports.Queries.GetInstructorReport;

public class InstructorReportService
{
    private readonly IApplicationDbContext _context;

    public InstructorReportService(IApplicationDbContext context)
    {
        _context = context;
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

        var grossRevenueQuery = _context.OrderItems
            .AsNoTracking()
            .Where(oi =>
                accessibleCourseIds.Contains(oi.CourseId) &&
                oi.Order.Status == OrderStatus.Completed &&
                oi.Order.CompletedDate.HasValue &&
                oi.Order.CompletedDate.Value >= fromInclusive &&
                oi.Order.CompletedDate.Value < toExclusive);

        var walletEarningsQuery = _context.InstructorWalletTransactions
            .AsNoTracking()
            .Where(t =>
                t.InstructorWallet.InstructorId == userId &&
                accessibleCourseIds.Contains(t.CourseId) &&
                t.Created >= fromInclusive &&
                t.Created < toExclusive);

        var enrollmentQuery = _context.Enrollments
            .AsNoTracking()
            .Where(e =>
                accessibleCourseIds.Contains(e.CourseId) &&
                e.Created >= fromInclusive &&
                e.Created < toExclusive);

        var ratingQuery = _context.RatingCourses
            .AsNoTracking()
            .Where(r =>
                accessibleCourseIds.Contains(r.CourseId) &&
                r.Created >= fromInclusive &&
                r.Created < toExclusive);

        var grossRevenueData = await InstructorReportTrendBuilder.BuildGrossRevenueTrendAsync(grossRevenueQuery, fromInclusive, toExclusive, aggregation, cancellationToken);
        var walletEarningsData = await InstructorReportTrendBuilder.BuildWalletEarningsTrendAsync(walletEarningsQuery, fromInclusive, toExclusive, aggregation, cancellationToken);
        var enrollmentData = await InstructorReportTrendBuilder.BuildEnrollmentTrendAsync(enrollmentQuery, fromInclusive, toExclusive, aggregation, cancellationToken);
        var ratingTrends = await InstructorReportTrendBuilder.BuildRatingTrendsAsync(ratingQuery, fromInclusive, toExclusive, aggregation, cancellationToken);

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
