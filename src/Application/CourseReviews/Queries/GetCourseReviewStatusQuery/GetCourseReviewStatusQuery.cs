using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Queries.GetCourseReviewStatusQuery;

public record GetCourseReviewStatusQuery : IRequest<CourseReviewStatusDto>
{
    public int CourseId { get; init; }
}

public class GetCourseReviewStatusQueryHandler : IRequestHandler<GetCourseReviewStatusQuery, CourseReviewStatusDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public GetCourseReviewStatusQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<CourseReviewStatusDto> Handle(GetCourseReviewStatusQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        // Access check — owner or collaborator
        var hasAccess = await _courseAuth.HasCourseAccessAsync(
            request.CourseId, userId, CoursePermission.None, cancellationToken);

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException("You do not have access to this course.");
        }

        var course = await _context.Courses
            .AsNoTracking()
            .Where(c => c.Id == request.CourseId)
            .Select(c => new { c.Id, c.Status })
            .FirstOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.CourseId, course);

        // Load all submissions (ordered)
        var submissions = await _context.CourseReviewSubmissions
            .AsNoTracking()
            .Where(s => s.CourseId == request.CourseId)
            .OrderByDescending(s => s.SubmissionNumber)
            .ToListAsync(cancellationToken);

        // Build history from all submissions (no feedbacks — compact)
        var history = submissions
            .Skip(1) // skip latest, it's shown in full
            .Select(s => new SubmissionHistoryItemDto
            {
                SubmissionNumber = s.SubmissionNumber,
                Status = s.Status,
                CreatedAt = s.Created,
                ReviewedAt = s.ReviewedAt,
            })
            .ToList();

        var latest = submissions.FirstOrDefault();
        LatestSubmissionDto latestDto = null;

        if (latest != null)
        {
            // Load feedbacks for latest submission only
            var feedbacks = await _context.CourseReviewFeedbacks
                .AsNoTracking()
                .Where(f => f.CourseReviewSubmissionId == latest.Id)
                .OrderBy(f => f.FeedbackType) // RequiredFix (0) first
                .ToListAsync(cancellationToken);

            var feedbackDtos = feedbacks.Select(f => new FeedbackItemDto
            {
                Id = f.Id,
                FeedbackType = f.FeedbackType,
                Category = f.Category,
                Content = f.Content,
                IsResolved = f.IsResolved,
            }).ToList();

            latestDto = new LatestSubmissionDto
            {
                Id = latest.Id,
                SubmissionNumber = latest.SubmissionNumber,
                Status = latest.Status,
                ReviewedAt = latest.ReviewedAt,
                AdminNote = latest.AdminNote,
                Feedbacks = feedbackDtos,
            };
        }

        return new CourseReviewStatusDto
        {
            CourseId = course.Id,
            CourseStatus = course.Status,
            LatestSubmission = latestDto,
            SubmissionHistory = history,
        };
    }
}
