using System.Text.Json;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;

namespace Edunary.Application.Users.Queries.GetAdminUserDetailQuery;

public record GetAdminUserDetailQuery : IRequest<AdminUserDetailDto>
{
    public string UserId { get; init; }
}

public class GetAdminUserDetailQueryHandler : IRequestHandler<GetAdminUserDetailQuery, AdminUserDetailDto>
{
    private readonly IIdentityService _identityService;
    private readonly IApplicationDbContext _context;
    private readonly IConnectionManagerService _connectionManager;
    private readonly IMapper _mapper;

    public GetAdminUserDetailQueryHandler(
        IIdentityService identityService,
        IApplicationDbContext context,
        IConnectionManagerService connectionManager,
        IMapper mapper)
    {
        _identityService = identityService;
        _context = context;
        _connectionManager = connectionManager;
        _mapper = mapper;
    }

    public async Task<AdminUserDetailDto> Handle(GetAdminUserDetailQuery request, CancellationToken cancellationToken)
    {
        //1. get user identity
        var user = await _identityService.GetUserIdentityByIdAsync(request.UserId);
        if (user == null) return null;

        //2. Count enrolled courses
        var enrollmentCount = await _context.Enrollments
            .CountAsync(e => e.StudentId == request.UserId, cancellationToken);

        //3. get all courses created by user
        var allCreatedCourses = await _context.Courses
            .Where(c => c.CreatedBy == request.UserId)
            .OrderByDescending(c => c.Created)
            .ProjectTo<AdminCreatedCourseDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        //courses metadata
        var totalLearners = allCreatedCourses.Sum(c => c.TotalStudents);
        var ratedCourses = allCreatedCourses.Where(c => c.Ratings > 0).ToList();
        var avgRating = ratedCourses.Count > 0 ? ratedCourses.Average(c => c.Ratings) : 0f;
        var top5CreatedCourses = allCreatedCourses.Take(5).ToList();

        //4. get top 5 enrolled courses
        var enrolledCourses = await _context.Enrollments
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
                    ProgressPercentage = 0f
                })
            .ToListAsync(cancellationToken);

        if (enrolledCourses.Count > 0)
        {
            var enrolledCourseIds = enrolledCourses.Select(e => e.CourseId).ToList();

            // get all progress records for top-5 enrolled courses
            var progressRecords = await _context.CourseProgress
                .Where(cp => enrolledCourseIds.Contains(cp.CourseId) && cp.StudentId == request.UserId)
                .ToListAsync(cancellationToken);

            var progressDict = progressRecords.ToDictionary(p => p.CourseId);

            foreach (var ec in enrolledCourses)
            {
                if (!progressDict.TryGetValue(ec.CourseId, out var record)
                    || string.IsNullOrEmpty(record.Progress))
                    continue;

                try
                {
                    var schema = JsonSerializer.Deserialize<ProgressJsonSchema>(record.Progress);
                    if (schema?.Contents?.Count > 0)
                    {
                        var allItems = schema.Contents.SelectMany(s => s.Items).ToList();
                        if (allItems.Count > 0)
                        {
                            var completed = allItems.Count(i => i.IsCompleted);
                            ec.ProgressPercentage = (float)completed / allItems.Count * 100f;
                        }
                    }
                }
                catch { /* JSON parse error → ProgressPercentage stays 0 */ }
            }
        }

        //5. total spent — sum of completed orders placed by this user
        var totalSpent = await _context.Orders
            .Where(o => o.UserId == request.UserId && o.Status == OrderStatus.Completed)
            .SumAsync(o => (float?)o.TotalAmount, cancellationToken) ?? 0f;

        //6. total earned — wallet lifetime balance (current balance + all withdrawn)
        var wallet = await _context.InstructorWallets
            .Where(w => w.InstructorId == request.UserId)
            .FirstOrDefaultAsync(cancellationToken);
        var totalEarned = wallet != null ? (float)(wallet.Balance + wallet.TotalWithdrawn) : 0f;

        //7. get user online status based on connection manager
        var isOnline = await _connectionManager.IsConnectedAsync(user.Id);

        //8. return dto
        return new AdminUserDetailDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Avatar = user.Avatar,
            Headline = user.Headline,
            Description = user.Description,
            Links = user.Links,
            Roles = user.Roles,
            Status = user.Status.ToString(),
            LastLoginTime = user.LastLoginTime.HasValue
                ? DateTime.SpecifyKind(user.LastLoginTime.Value, DateTimeKind.Utc)
                : (DateTime?)null,
            CreatedAt = user.CreatedAt,
            IsOnline = isOnline,

            Stats = new AdminUserStatsDto
            {
                EnrolledCourseCount = enrollmentCount,
                CreatedCourseCount = allCreatedCourses.Count,
                TotalLearners = totalLearners,
                AvgRating = (float)Math.Round(avgRating, 1),
                TotalSpent = totalSpent,
                TotalEarned = totalEarned,
            },

            EnrolledCourses = enrolledCourses,
            CreatedCourses = top5CreatedCourses,
        };
    }
}
