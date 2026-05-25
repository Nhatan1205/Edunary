using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Common;
using Edunary.Domain.Events.CourseReviews;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Edunary.Application.CourseReviews.EventHandlers;

public class CourseReviewChangesRequestedEventHandler : INotificationHandler<CourseReviewChangesRequestedEvent>
{
    private readonly ILogger<CourseReviewChangesRequestedEventHandler> _logger;
    private readonly INotifyService _notifyService;
    private readonly IEmailService _emailService;
    private readonly IIdentityService _identityService;
    private readonly AppSettings _appSettings;

    public CourseReviewChangesRequestedEventHandler(
        ILogger<CourseReviewChangesRequestedEventHandler> logger,
        INotifyService notifyService,
        IEmailService emailService,
        IIdentityService identityService,
        IOptions<AppSettings> appSettings)
    {
        _logger = logger;
        _notifyService = notifyService;
        _emailService = emailService;
        _identityService = identityService;
        _appSettings = appSettings.Value;
    }

    public async Task Handle(CourseReviewChangesRequestedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Edunary Domain Event: {DomainEvent}", notification.GetType().Name);

        var submission = notification.Item;
        var course = submission.Course;
        var instructorId = course.CreatedBy;
        var courseTitle = course.Title;
        var courseId = course.Id;

        // Notify instructor
        await _notifyService.NotifyUserAsync(
            instructorId,
            "Course Review: Changes Required",
            $"Your course \"{courseTitle}\" requires changes before it can be published.",
            "course_needs_changes",
            new { courseId, submissionId = submission.Id },
            cancellationToken,
            courseId: courseId,
            url: $"/instructor/course/{courseId}/manage/feedback",
            imageUrl: course.ImageUrl ?? string.Empty);

        // Email instructor
        var instructor = await _identityService.GetUserById(instructorId);
        if (instructor != null && !string.IsNullOrEmpty(instructor.Email))
        {
            var actionUrl = $"{_appSettings.ClientUrl}/instructor/courses/{courseId}/manage/feedback";
            var html = EmailTemplates.BuildCourseNeedsChangesTemplate(
                instructor.FullName ?? instructor.Email,
                courseTitle,
                notification.AdminNote,
                actionUrl);

            await _emailService.SendBulkEmailsAsync(new[] { instructor.Email }, "Your course requires changes", html);
        }
    }
}
