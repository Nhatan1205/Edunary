using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Domain.Common;
using Edunary.Domain.Events.Courses;
using Microsoft.EntityFrameworkCore;
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

    public ApproveCourseCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
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
                    q.Description,
                    q.RelatedItemId,
                    q.ItemId,
                    q.TimeLimitMinutes,
                    q.PassingScore,
                    q.MaxAttempts,
                    q.ShowCorrectAnswers,
                    q.RandomizeQuestions,
                    Questions = q.Questions.OrderBy(x => x.SortOrder).Select(x => new
                    {
                        x.Id,
                        x.Name,
                        Type = (int)x.Type,
                        x.Explanation,
                        x.SortOrder,
                        Choices = x.Choices.OrderBy(c => c.SortOrder).Select(c => new
                        {
                            c.Id,
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
                        x.Id,
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
        course.AddDomainEvent(new CourseApprovedEvent(course));

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(message: "Course approved and published successfully.");
    }
}
