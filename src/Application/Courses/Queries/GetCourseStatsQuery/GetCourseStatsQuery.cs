using Edunary.Application.Common.Interfaces;
using Edunary.Application.Courses.Queries.GetCourseStatsQuery;
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

    public GetCoursesStatsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }
    public async Task<CourseStatsVM> Handle(GetCourseStatsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        // Basic Query 
        var query = _context.Enrollments
            .Where(e => e.Course.CreatedBy == userId);
        if (request.CourseId is not null)
            query = query.Where(e => e.CourseId == request.CourseId);
        // --- Stats Data ---
        var (startDate, aggregation) = ResolveDateRange(request.DateRange);
        var statsQuery = query.Where(e => e.Created >= startDate);


        List<DataPointDto> data;
        //daily
        if (aggregation == "daily")
        {
            data = await statsQuery
                .GroupBy(e => e.Created.Date)
                .Select(g => new DataPointDto
                {
                    Date = g.Key,
                    Value = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();
        }
        else // monthly
        {
            var monthlyData = await statsQuery
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

            data = monthlyData
                .Select(x => new DataPointDto
                {
                    Date = new DateTime(x.Year, x.Month, 1),
                    Value = x.Count
                })
                .ToList();
        }

        int totalCount = data.Sum(x => x.Value);

        var statsDto = new GetCourseStatsDto
        {
            CourseId = request.CourseId, 
            DateRange = request.DateRange,
            AggregationLevel = aggregation,
            Metric = request.Metric,
            Data = data,
            Total = totalCount
        };
        // --- Summary Data ---
        var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var monthlyQuery = query
            .Where(e => e.Created >= startOfMonth);
        var totalQuery = query;
        // Current month
        var totalEnrollmentsMonth = await monthlyQuery.CountAsync();
        // All time
        var totalEnrollments = await totalQuery.CountAsync();


        var summaryDto = new GetCourseStatsSummaryDto
        {
            TotalEnrollments = totalEnrollments,
            TotalEnrollmentsThisMonth = totalEnrollmentsMonth,
            TotalRevenue = 0,
            TotalRevenueThisMonth = 0,
            AverageRating = 0,
            AverageRatingThisMonth = 0
        };
        return new CourseStatsVM
        {
            Stats = statsDto,
            Summary = summaryDto
        };
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


