using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Courses.Queries.GetCourseStatsQuery;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Edunary.Application.Courses.Queries.GetCoursesStatsQuery;


public class GetCourseStatsQuery : IRequest<CourseStatsVM>
{
    public int? CourseId { get; init; }
    public string DateRange { get; init; }
    public string Metric { get; init; }
}

public class GetCoursesStatsQueryHandler : IRequestHandler<GetCourseStatsQuery, CourseStatsVM>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuthService;

    public GetCoursesStatsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService, ICourseAuthorizationService courseAuthService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuthService = courseAuthService;
    }
    public async Task<CourseStatsVM> Handle(GetCourseStatsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;

        if (request.CourseId.HasValue)
        {
            if (!await _courseAuthService.HasCourseAccessAsync(request.CourseId.Value, userId, CoursePermission.Performance, cancellationToken))
            {
                return new CourseStatsVM
                {
                    Stats = new GetCourseStatsDto { Data = new List<DataPointDto>() },
                    Summary = new GetCourseStatsSummaryDto()
                };
            }
        }

        // -------------------------------
        // Base QUERY for total enrollments
        // -------------------------------
        var enrollmentQuery = _context.Enrollments
            .Where(e => e.Course.CreatedBy == userId || e.Course.Collaborators.Any(cc => cc.UserId == userId && cc.InviteStatus == CollaboratorInviteStatus.Accepted && cc.Permissions.HasFlag(CoursePermission.Performance)));
        
        if (request.CourseId is not null)
        {
            enrollmentQuery = enrollmentQuery.Where(e => e.CourseId == request.CourseId);
        }
        
        // -------------------------------
        // Base QUERY for average rating
        // -------------------------------
        var ratingQuery = _context.RatingCourses
            .Where(r => r.Course.CreatedBy == userId || r.Course.Collaborators.Any(cc => cc.UserId == userId && cc.InviteStatus == CollaboratorInviteStatus.Accepted && cc.Permissions.HasFlag(CoursePermission.Performance)));

        if (request.CourseId is not null)
        {
            ratingQuery = ratingQuery.Where(r => r.CourseId == request.CourseId);
        }

        // -------------------------------
        // Base QUERY for revenue
        // -------------------------------
        var revenueQuery = _context.InstructorWalletTransactions
            .Where(t => t.InstructorWallet.InstructorId == userId);

        if (request.CourseId is not null)
        {
            revenueQuery = revenueQuery.Where(t => t.CourseId == request.CourseId);
        }

        // -------------------------------
        // Date Range
        // -------------------------------
        var (startDate, aggregation) = ResolveDateRange(request.DateRange);

        var statsEnrollmentQuery = enrollmentQuery.Where(e => e.Created >= startDate);
        var statsRatingQuery = ratingQuery.Where(r => r.Created >= startDate);
        var statsRevenueQuery = revenueQuery.Where(t => t.Created >= startDate);

        // -------------------------------
        // build DATA for CHART
        // -------------------------------
        List<DataPointDto> data;
        switch (request.Metric)
        {
            case "revenue":
                data = await BuildRevenueStats(statsRevenueQuery, aggregation);
                break;

            case "rating":
                data = await BuildRatingStats(statsRatingQuery, aggregation);
                break;

            case "enrollment":
            default:
                data = await BuildEnrollmentStats(statsEnrollmentQuery, aggregation);
                break;
        }

        float totalValue;
        if (data.Count == 0)
        {
            totalValue = 0;
        }
        else if (request.Metric == "rating")
            totalValue = data.Average(x => x.Value);
        else
            totalValue = data.Sum(x => x.Value);

        var statsDto = new GetCourseStatsDto
        {
            CourseId = request.CourseId,
            DateRange = request.DateRange,
            AggregationLevel = aggregation,
            Metric = request.Metric,
            Data = data,
            Total = totalValue
        };
        // -------------------------------
        // BUILD SUMMARY DATA
        // -------------------------------
        var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        // Summary - enrollments
        var totalEnrollments = await enrollmentQuery.CountAsync();
        var totalEnrollmentsThisMonth = await enrollmentQuery.Where(e => e.Created >= startOfMonth).CountAsync();

        // Summary - ratings
        var totalRatingQuery = ratingQuery;
        var monthlyRatingQuery = ratingQuery.Where(r => r.Created >= startOfMonth);

        var avgRating = await totalRatingQuery.AnyAsync()
            ? await totalRatingQuery.AverageAsync(r => r.Rating)
            : 0;

        var avgRatingThisMonth = await monthlyRatingQuery.AnyAsync()
            ? await monthlyRatingQuery.AverageAsync(r => r.Rating)
            : 0;


        var totalRevenue = await revenueQuery.SumAsync(t => (decimal?)t.Amount) ?? 0m;
        var totalRevenueThisMonth = await revenueQuery
            .Where(t => t.Created >= startOfMonth)
            .SumAsync(t => (decimal?)t.Amount) ?? 0m;

        var summaryDto = new GetCourseStatsSummaryDto
        {
            TotalEnrollments = totalEnrollments,
            TotalEnrollmentsThisMonth = totalEnrollmentsThisMonth,
            TotalRevenue = (float)totalRevenue,
            TotalRevenueThisMonth = (float)totalRevenueThisMonth,
            AverageRating = (float)avgRating,
            AverageRatingThisMonth = (float)avgRatingThisMonth
        };
        return new CourseStatsVM
        {
            Stats = statsDto,
            Summary = summaryDto
        };
    }

    // =====================================================================
    // BUILD REVENUE STATS
    // =====================================================================
    private async Task<List<DataPointDto>> BuildRevenueStats(IQueryable<InstructorWalletTransaction> query, string aggregation)
    {
        if (aggregation == "daily")
        {
            return await query
                .GroupBy(t => t.Created.Date)
                .Select(g => new DataPointDto
                {
                    Date = g.Key,
                    Value = (float)g.Sum(x => x.Amount)
                })
                .OrderBy(x => x.Date)
                .ToListAsync();
        }

        var monthlyData = await query
            .GroupBy(t => new { t.Created.Year, t.Created.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Total = g.Sum(x => x.Amount)
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync();

        return monthlyData.Select(x => new DataPointDto
        {
            Date = new DateTime(x.Year, x.Month, 1),
            Value = (float)x.Total
        }).ToList();
    }

    // =====================================================================
    // BUILD ENROLLMENT STATS
    // =====================================================================
    private async Task<List<DataPointDto>> BuildEnrollmentStats(IQueryable<Enrollment> query, string aggregation)
    {
        if (aggregation == "daily")
        {
            return await query
                .GroupBy(e => e.Created.Date)
                .Select(g => new DataPointDto
                {
                    Date = g.Key,
                    Value = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();
        }

        var monthlyData = await query
            .GroupBy(e => new { e.Created.Year, e.Created.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Count = g.Count()
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync();

        return monthlyData.Select(x => new DataPointDto
        {
            Date = new DateTime(x.Year, x.Month, 1),
            Value = x.Count
        }).ToList();
    }

    // =====================================================================
    // BUILD RATING STATS
    // =====================================================================
    private async Task<List<DataPointDto>> BuildRatingStats(IQueryable<RatingCourse> query, string aggregation)
    {
        if (aggregation == "daily")
        {
            return await query
                .GroupBy(r => r.LastModified.Date)
                .Select(g => new DataPointDto
                {
                    Date = g.Key,
                    Value = (float)g.Average(x => x.Rating)
                })
                .OrderBy(x => x.Date)
                .ToListAsync();
        }

        var monthlyData = await query
            .GroupBy(r => new { r.LastModified.Year, r.LastModified.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                AvgRating = g.Average(x => x.Rating)
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync();

        return monthlyData.Select(x => new DataPointDto
        {
            Date = new DateTime(x.Year, x.Month, 1),
            Value = (float)x.AvgRating
        }).ToList();
    }



    private (DateTime start, string aggregation) ResolveDateRange(string range)
    {
        var today = DateTime.UtcNow.Date;

        return range switch
        {
            "week" => (today.AddDays(-7), "daily"),
            "month" => (today.AddDays(-30), "daily"),
            "year" => (today.AddMonths(-12), "monthly"),
            _ => (today.AddMonths(-12), "monthly")
        };
    }
}


