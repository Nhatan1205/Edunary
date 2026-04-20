using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Users;
using Edunary.Domain.Enums;

namespace Edunary.Application.Users.Queries.GetAdminUserDetailQuery;

public record GetAdminUserDetailQuery : IRequest<AdminUserDetailDto>
{
    public string UserId { get; init; }
}

public class GetAdminUserDetailQueryHandler
    : IRequestHandler<GetAdminUserDetailQuery, AdminUserDetailDto>
{
    private readonly IIdentityService _identityService;
    private readonly IApplicationDbContext _context;
    private readonly IConnectionManagerService _connectionManager;

    public GetAdminUserDetailQueryHandler(
        IIdentityService identityService,
        IApplicationDbContext context,
        IConnectionManagerService connectionManager)
    {
        _identityService = identityService;
        _context = context;
        _connectionManager = connectionManager;
    }

    public async Task<AdminUserDetailDto> Handle(
        GetAdminUserDetailQuery request, CancellationToken cancellationToken)
    {
        // ── Step 1: Lấy Identity data của user ──────────────────────────────────
        // Chỉ gồm thông tin từ AspNetUsers + Roles, không có business data.
        var user = await _identityService.GetUserIdentityByIdAsync(request.UserId);
        if (user == null) return null;

        // ── Step 2: Chạy TẤT CẢ queries độc lập SONG SONG với Task.WhenAll ─────
        // Các queries này không phụ thuộc nhau → chạy parallel để giảm latency.
        // Thay vì tổng thời gian = T1+T2+T3+T4+T5+T6, giờ = max(T1,T2,T3,T4,T5,T6)

        // Count enrolled courses của user này
        var enrollmentCountTask = _context.Enrollments
            .CountAsync(e => e.StudentId == request.UserId, cancellationToken);

        // Count courses đã tạo
        var courseCountTask = _context.Courses
            .CountAsync(c => c.CreatedBy == request.UserId, cancellationToken);

        // Tổng tiền đã chi (student): SUM tất cả Orders completed
        var totalSpentTask = _context.Orders
            .Where(o => o.UserId == request.UserId && o.Status == OrderStatus.Completed)
            .SumAsync(o => (float?)o.TotalAmount, cancellationToken);

        // Tổng tiền kiếm được (instructor): SUM OrderItems của các course mình tạo
        // Dùng subquery: Any(...) được EF Core translate sang EXISTS(...)
        var totalEarnedTask = _context.OrderItems
            .Where(oi =>
                _context.Courses.Any(c => c.Id == int.Parse(oi.CourseId) && c.CreatedBy == request.UserId)
                && _context.Orders.Any(o => o.Id == oi.OrderId && o.Status == OrderStatus.Completed))
            .SumAsync(oi => (float?)oi.Price, cancellationToken);

        // 5 khóa học gần nhất đã enroll — JOIN với Courses để lấy title/image
        var enrolledCoursesTask = _context.Enrollments
            .Where(e => e.StudentId == request.UserId)
            .OrderByDescending(e => e.Created)
            .Take(5)
            .Join(_context.Courses,
                e => e.CourseId,
                c => c.Id,
                (e, c) => new AdminEnrolledCourseDto
                {
                    CourseId = c.Id,
                    CourseTitle = c.Title,
                    CourseImage = c.ImageUrl,
                    EnrolledDate = e.Created.DateTime,
                    ProgressPercentage = 0f // sẽ tính sau khi có progress data
                })
            .ToListAsync(cancellationToken);

        // 5 khóa học gần nhất đã tạo
        var createdCoursesTask = _context.Courses
            .Where(c => c.CreatedBy == request.UserId)
            .OrderByDescending(c => c.Created)
            .Take(5)
            .Select(c => new AdminCreatedCourseDto
            {
                CourseId = c.Id,
                CourseTitle = c.Title,
                CourseImage = c.ImageUrl,
                Status = c.Status.ToString(),
                TotalStudents = c.TotalStudents,
                Ratings = c.Ratings,
            })
            .ToListAsync(cancellationToken);

        // Chờ TẤT CẢ 6 queries hoàn thành cùng lúc
        await Task.WhenAll(
            enrollmentCountTask, courseCountTask,
            totalSpentTask, totalEarnedTask,
            enrolledCoursesTask, createdCoursesTask);

        // ── Step 3: Tính % hoàn thành cho enrolled courses ───────────────────────
        var enrolledCourses = enrolledCoursesTask.Result;

        if (enrolledCourses.Any())
        {
            // Batch fetch TẤT CẢ progress records trong 1 query (thay vì 5 queries riêng lẻ)
            // SQL: SELECT * FROM CourseProgress WHERE CourseId IN (@ids) AND StudentId = @userId
            var enrolledCourseIds = enrolledCourses.Select(e => e.CourseId).ToList();
            var progressRecords = await _context.CourseProgress
                .Where(cp => enrolledCourseIds.Contains(cp.CourseId) && cp.StudentId == request.UserId)
                .ToListAsync(cancellationToken);

            // Convert sang Dictionary để lookup O(1) theo CourseId
            var progressDict = progressRecords.ToDictionary(p => p.CourseId);

            foreach (var ec in enrolledCourses)
            {
                // Tìm progress record cho course này
                if (!progressDict.TryGetValue(ec.CourseId, out var record)
                    || string.IsNullOrEmpty(record.Progress))
                    continue;

                try
                {
                    // Progress được lưu dạng JSON theo schema CourseContentSchema:
                    // { contents: [{ items: [{ isCompleted: bool }, ...] }] }
                    var schema = JsonSerializer.Deserialize<ProgressJsonSchema>(record.Progress);
                    if (schema?.Contents?.Count > 0)
                    {
                        // Flatten tất cả items từ tất cả sections
                        var allItems = schema.Contents.SelectMany(s => s.Items).ToList();
                        if (allItems.Count > 0)
                        {
                            // % = số items completed / tổng items × 100
                            var completed = allItems.Count(i => i.IsCompleted);
                            ec.ProgressPercentage = (float)completed / allItems.Count * 100f;
                        }
                    }
                }
                catch { /* JSON parse error → để ProgressPercentage = 0 */ }
            }
        }

        // ── Step 4: Lấy online status (in-memory, không tốn I/O) ─────────────────
        var onlineUserIds = _connectionManager.GetAllOnlineUserIds();

        // ── Step 5: Assemble DTO từ tất cả data đã có ────────────────────────────
        return new AdminUserDetailDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Avatar = user.Avatar,
            Headline = user.Headline,
            Roles = user.Roles,
            Status = user.Status.ToString(),
            LastLoginTime = user.LastLoginTime,
            CreatedAt = user.CreatedAt,
            IsOnline = onlineUserIds.Contains(user.Id),

            Stats = new AdminUserStatsDto
            {
                EnrolledCourseCount = enrollmentCountTask.Result,
                CreatedCourseCount = courseCountTask.Result,
                TotalSpent = totalSpentTask.Result ?? 0f,
                TotalEarned = totalEarnedTask.Result ?? 0f,
            },

            EnrolledCourses = enrolledCourses,
            CreatedCourses = createdCoursesTask.Result,
        };
    }
}
