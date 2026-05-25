using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Edunary.Domain.Common;

namespace Edunary.Application.CourseReviews.Commands.RequestChangesCommand;

public record RequestChangesCommand : IRequest<Result>
{
    public int SubmissionId { get; init; }
    public string AdminNote { get; init; }
}

public class RequestChangesCommandHandler : IRequestHandler<RequestChangesCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;
    private readonly INotifyService _notifyService;
    private readonly IEmailService _emailService;
    private readonly AppSettings _appSettings;

    public RequestChangesCommandHandler(
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

    public async Task<Result> Handle(RequestChangesCommand request, CancellationToken cancellationToken)
    {
        var adminId = _currentUserService.UserId;

        var submission = await _context.CourseReviewSubmissions
            .Include(s => s.Course)
            .Include(s => s.Feedbacks)
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, cancellationToken);

        Guard.Against.NotFound(request.SubmissionId, submission);

        if (submission.Status != ReviewSubmissionStatus.Pending)
        {
            return Result.Failure("Can only request changes on submissions with 'Pending' status.");
        }

        // Update submission
        submission.Status = ReviewSubmissionStatus.NeedsChanges;
        submission.ReviewedByAdminId = adminId;
        submission.ReviewedAt = DateTimeOffset.UtcNow;
        submission.AdminNote = request.AdminNote;

        // Update course status
        submission.Course.Status = CourseStatus.NeedsChanges;

        await _context.SaveChangesAsync(cancellationToken);

        // Notify instructor
        var instructorId = submission.Course.CreatedBy;
        var courseTitle = submission.Course.Title;
        var courseId = submission.Course.Id;

        await _notifyService.NotifyUserAsync(
            instructorId,
            "Course Review: Changes Required",
            $"Your course \"{courseTitle}\" requires changes before it can be published.",
            "course_needs_changes",
            new { courseId, submissionId = submission.Id },
            cancellationToken,
            courseId: courseId,
            url: $"/instructor/course/{courseId}/manage/feedback",
            imageUrl: submission.Course.ImageUrl ?? string.Empty);

        // Email instructor
        var instructor = await _identityService.GetUserById(instructorId);
        if (instructor != null && !string.IsNullOrEmpty(instructor.Email))
        {
            var actionUrl = $"{_appSettings.ClientUrl}/instructor/courses/{courseId}/manage/feedback";
            var html = EmailTemplates.BuildCourseNeedsChangesTemplate(
                instructor.FullName ?? instructor.Email,
                courseTitle,
                request.AdminNote,
                actionUrl);

            await _emailService.SendBulkEmailsAsync(new[] { instructor.Email }, "Your course requires changes", html);
        }

        return Result.Success(message: "Changes requested successfully.");
    }
}
