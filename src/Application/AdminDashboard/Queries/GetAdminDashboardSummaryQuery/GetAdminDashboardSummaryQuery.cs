using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.AdminDashboard.Queries.GetAdminDashboardSummaryQuery;

public record GetAdminDashboardSummaryQuery : IRequest<AdminDashboardSummaryDto>;

public class GetAdminDashboardSummaryQueryHandler
    : IRequestHandler<GetAdminDashboardSummaryQuery, AdminDashboardSummaryDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IConnectionManagerService _connectionManager;

    public GetAdminDashboardSummaryQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        IConnectionManagerService connectionManager)
    {
        _context = context;
        _identityService = identityService;
        _connectionManager = connectionManager;
    }

    public async Task<AdminDashboardSummaryDto> Handle(
        GetAdminDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);
        var sixtyDaysAgo = now.AddDays(-60);
        var todayStart = new DateTimeOffset(now.Date, TimeSpan.Zero);

        // 1. get Users stats
        var userStats = await _identityService.GetOverviewStatsAsync(cancellationToken);

        //2. get online users count
        var onlineNow = (int)await _connectionManager.GetOnlineCountAsync();

        //3. get Courses stats
        var courseGroups = await _context.Courses
            .GroupBy(c => 1)
            .Select(g => new
            {
                Total         = g.Count(),
                Published     = g.Count(c => c.Status == CourseStatus.Public),
                Private       = g.Count(c => c.Status == CourseStatus.Private),
                Draft         = g.Count(c => c.Status == CourseStatus.Unpublished),
                PendingReview = g.Count(c => c.Status == CourseStatus.PendingReview),
                NeedsChanges  = g.Count(c => c.Status == CourseStatus.NeedsChanges),
                PendingChanges = g.Count(c =>
                    c.Status == CourseStatus.Public
                    && c.ApprovedSnapshots.Any()
                    && c.LastModified > c.ApprovedSnapshots.Max(s => s.Created).AddSeconds(2)),
            })
            .FirstOrDefaultAsync(cancellationToken);

        var totalCourses = courseGroups?.Total ?? 0;

        var coursesNewThisPeriod = await _context.Courses
            .CountAsync(c => c.Created >= thirtyDaysAgo, cancellationToken);
        var coursesPrevPeriod = await _context.Courses
            .CountAsync(c => c.Created >= sixtyDaysAgo && c.Created < thirtyDaysAgo, cancellationToken);
        var courseTrend = ComputeTrend(coursesNewThisPeriod, coursesPrevPeriod);

        // 4. Enrollments (needed for completion/active rates)
        var totalEnrollments = await _context.Enrollments.CountAsync(cancellationToken);

        // 5. Active enrollment rate: progress records updated in last 30d
        double activeEnrollmentRate = 0;
        if (totalEnrollments > 0)
        {
            var activeCount = await _context.CourseProgress
                .CountAsync(cp => cp.LastModified >= thirtyDaysAgo, cancellationToken);
            activeEnrollmentRate = Math.Round((double)activeCount / totalEnrollments * 100, 1);
        }

        // 6. Completion rate: CourseProgress rows / total Enrollments
        var totalProgressRecords = await _context.CourseProgress.CountAsync(cancellationToken);
        var completionRate = totalEnrollments > 0
            ? Math.Round((double)totalProgressRecords / totalEnrollments * 100, 1)
            : 0;

        // 7. Average platform rating
        double avgRating = 0;
        var hasRatings = await _context.RatingCourses.AnyAsync(cancellationToken);
        if (hasRatings)
        {
            avgRating = Math.Round(
                await _context.RatingCourses.AverageAsync(r => (double)r.Rating, cancellationToken), 1);
        }

        // 8. Revenue (from FinancialEntries / ledger)
        var revenueRows = await _context.FinancialEntries
            .Join(_context.FinancialTransactions,
                e => e.TransactionId,
                t => t.Id,
                (e, t) => new { e, t })
            .Where(x => x.t.Status == LedgerTransactionStatus.Posted
                     && x.t.TransactionType == LedgerTransactionType.OrderPaid
                     && x.e.AccountCode == LedgerAccountCode.CashStripe
                     && x.e.Side == EntrySide.Debit)
            .Select(x => new { OccurredAt = x.t.OccurredAt, Amount = x.e.Amount })
            .ToListAsync(cancellationToken);

        var totalRevenue      = revenueRows.Sum(r => r.Amount);
        var revenueThisPeriod = revenueRows
            .Where(r => r.OccurredAt >= thirtyDaysAgo)
            .Sum(r => r.Amount);
        var revenuePrevPeriod = revenueRows
            .Where(r => r.OccurredAt >= sixtyDaysAgo && r.OccurredAt < thirtyDaysAgo)
            .Sum(r => r.Amount);
        var revenueToday = revenueRows
            .Where(r => r.OccurredAt >= todayStart)
            .Sum(r => r.Amount);
        var revenueTrend = ComputeTrend((double)revenueThisPeriod, (double)revenuePrevPeriod);

        // 9. Pending actions
        var pendingApprovals = await _context.CourseReviewSubmissions
            .CountAsync(s => s.Status == ReviewSubmissionStatus.Pending, cancellationToken);

        var pendingWithdrawals = await _context.WithdrawalRequests
            .CountAsync(w => w.Status == InstructorWalletTransactionStatus.Processing, cancellationToken);

        var pendingCourseChanges = courseGroups?.PendingChanges ?? 0;
        var totalPending = pendingApprovals + pendingWithdrawals + pendingCourseChanges;

        return new AdminDashboardSummaryDto
        {
            // KPI cards
            TotalUsers             = userStats.ActiveUsers,
            TotalUsersTrend        = userStats.NewUsersTrend,
            TotalCourses           = totalCourses,
            TotalCoursesTrend      = courseTrend,
            TotalRevenue           = totalRevenue,
            TotalRevenueTrend      = revenueTrend,

            // Today snapshot
            OnlineNow              = onlineNow,
            RevenueToday           = revenueToday,
            PendingActionsTotal    = totalPending,

            // Pending actions
            PendingApprovals       = pendingApprovals,
            PendingWithdrawals     = pendingWithdrawals,
            PendingCourseChanges   = pendingCourseChanges,

            // Health gauges
            CompletionRate         = completionRate,
            AverageRating          = avgRating,
            ActiveEnrollmentRate   = activeEnrollmentRate,

            // Course status distribution
            CourseStatusPublished     = courseGroups?.Published ?? 0,
            CourseStatusPrivate       = courseGroups?.Private ?? 0,
            CourseStatusDraft         = courseGroups?.Draft ?? 0,
            CourseStatusPendingReview = courseGroups?.PendingReview ?? 0,
            CourseStatusNeedsChanges  = courseGroups?.NeedsChanges ?? 0,
        };
    }

    private static double ComputeTrend(double current, double previous)
    {
        if (previous == 0)
        {
            return current > 0 ? 100 : 0;
        }
        return Math.Round((current - previous) / previous * 100, 1);
    }
}
