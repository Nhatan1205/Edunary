using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace Edunary.Application.CourseReviews.Commands.ApproveCourseCommand;

public record ApproveCourseCommand : IRequest<Result>
{
    public int SubmissionId { get; init; }
}

public class ApproveCourseCommandHandler : IRequestHandler<ApproveCourseCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;
    private readonly INotifyService _notifyService;
    private readonly IEmailService _emailService;
    private readonly AppSettings _appSettings;

    public ApproveCourseCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService,
        INotifyService notifyService,
        IEmailService emailService,
        IOptions<AppSettings> appSettings)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
        _notifyService = notifyService;
        _emailService = emailService;
        _appSettings = appSettings.Value;
    }

    public async Task<Result> Handle(ApproveCourseCommand request, CancellationToken cancellationToken)
    {
        var adminId = _currentUserService.UserId;

        // Load submission + course
        var submission = await _context.CourseReviewSubmissions
            .Include(s => s.Feedbacks)
            .Include(s => s.Course)
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, cancellationToken);

        Guard.Against.NotFound(request.SubmissionId, submission);

        if (submission.Status != ReviewSubmissionStatus.Pending)
        {
            return Result.Failure("Can only approve submissions with 'Pending' status.");
        }

        // Block if there are unresolved RequiredFix feedbacks
        var hasRequiredFix = submission.Feedbacks.Any(f => f.FeedbackType == ReviewFeedbackType.RequiredFix);
        if (hasRequiredFix)
        {
            return Result.Failure("Cannot approve: submission has RequiredFix feedback items. Use 'Request Changes' instead.");
        }

        var courseId = submission.Course.Id;

        //Fetch all data for snapshot

        var course = await _context.Courses
            .Include(c => c.MediaFiles.Where(m => !m.IsDeleted))
            .Include(c => c.Topics)
            .FirstOrDefaultAsync(c => c.Id == courseId, cancellationToken);

        var quizzes = await _context.Quizzes
            .Where(q => q.CourseId == courseId)
            .Include(q => q.Questions)
                .ThenInclude(q => q.Choices)
            .ToListAsync(cancellationToken);

        var assignments = await _context.Assignments
            .Where(a => a.CourseId == courseId)
            .Include(a => a.Questions)
            .ToListAsync(cancellationToken);

        // Build snapshot

        var snapshot = new CourseApprovedSnapshot
        {
            CourseId = courseId,
            CourseReviewSubmissionId = submission.Id,
            // Scalar fields
            Title = course.Title,
            Subtitle = course.Subtitle,
            Description = course.Description,
            Level = course.Level,
            LearningObjectives = course.LearningObjectives,
            Requirements = course.Requirements,
            TargetAudience = course.TargetAudience,
            ImageUrl = course.ImageUrl,
            WelcomeMessage = course.WelcomeMessage,
            CongratulationsMessage = course.CongratulationsMessage,
            Price = course.Price,
            CategoryId = course.CategoryId,
            AllowPlatformCoupons = course.AllowPlatformCoupons,
            Content = course.Content,
            TopicIds = JsonSerializer.Serialize(course.Topics.Select(t => t.Id).ToList()),
            MediaFilesJson = JsonSerializer.Serialize(
                course.MediaFiles.Select(m => new
                {
                    m.Id,
                    m.FileName,
                    m.FileUrl,
                    m.ContentType,
                    m.Duration,
                    m.ThumbnailUrl,
                    m.FileSize,
                })),
            QuizzesJson = JsonSerializer.Serialize(
                quizzes.Select(q => new
                {
                    q.Id,
                    q.Title,
                    q.ItemId,
                    q.TimeLimitMinutes,
                    q.PassingScore,
                    q.MaxAttempts,
                    q.ShowCorrectAnswers,
                    q.RandomizeQuestions,
                    Questions = q.Questions.OrderBy(x => x.SortOrder).Select(x => new
                    {
                        x.Name,
                        Type = (int)x.Type,
                        x.Explanation,
                        x.SortOrder,
                        Choices = x.Choices.OrderBy(c => c.SortOrder).Select(c => new
                        {
                            c.Text,
                            c.IsCorrect,
                            c.SortOrder,
                        }),
                    }),
                })),
            AssignmentsJson = JsonSerializer.Serialize(
                assignments.Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.ItemId,
                    a.Description,
                    a.Instructions,
                    a.EstimatedDurationMinutes,
                    Questions = a.Questions.OrderBy(x => x.SortOrder).Select(x => new
                    {
                        x.QuestionText,
                        x.ExampleAnswer,
                        x.SortOrder,
                    }),
                })),
        };

        _context.CourseApprovedSnapshots.Add(snapshot);

        // Update submission + course

        submission.Status = ReviewSubmissionStatus.Approved;
        submission.ReviewedByAdminId = adminId;
        submission.ReviewedAt = DateTimeOffset.UtcNow;

        course.Status = CourseStatus.Public;

        await _context.SaveChangesAsync(cancellationToken);

        // Notify instructor

        var instructorId = course.CreatedBy;

        await _notifyService.NotifyUserAsync(
            instructorId,
            "Course Approved & Published! 🎉",
            $"Your course \"{course.Title}\" has been approved and is now live.",
            "course_approved",
            new { courseId },
            cancellationToken,
            courseId: courseId,
            url: $"/course/{courseId}",
            imageUrl: course.ImageUrl ?? string.Empty);

        var instructor = await _identityService.GetUserById(instructorId);
        if (instructor != null && !string.IsNullOrEmpty(instructor.Email))
        {
            var courseUrl = $"{_appSettings.ClientUrl}/course/{courseId}";
            var html = EmailTemplates.BuildCourseApprovedTemplate(
                instructor.FullName ?? instructor.Email,
                course.Title,
                courseUrl);

            await _emailService.SendBulkEmailsAsync(new[] { instructor.Email }, $"Your course \"{course.Title}\" is now published!", html);
        }

        return Result.Success(message: "Course approved and published successfully.");
    }
}
