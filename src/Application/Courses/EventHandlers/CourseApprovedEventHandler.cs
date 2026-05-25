using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Common;
using Edunary.Domain.Events.Courses;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Edunary.Application.Courses.EventHandlers;

public class CourseApprovedEventHandler : INotificationHandler<CourseApprovedEvent>
{
    private readonly ILogger<CourseApprovedEventHandler> _logger;
    private readonly INotifyService _notifyService;
    private readonly IEmailService _emailService;
    private readonly IIdentityService _identityService;
    private readonly AppSettings _appSettings;
    private readonly ICourseEmbeddingJobService _embeddingJobService;

    public CourseApprovedEventHandler(
        ILogger<CourseApprovedEventHandler> logger,
        INotifyService notifyService,
        IEmailService emailService,
        IIdentityService identityService,
        IOptions<AppSettings> appSettings,
        ICourseEmbeddingJobService embeddingJobService)
    {
        _logger = logger;
        _notifyService = notifyService;
        _emailService = emailService;
        _identityService = identityService;
        _appSettings = appSettings.Value;
        _embeddingJobService = embeddingJobService;
    }

    public async Task Handle(CourseApprovedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Edunary Domain Event: {DomainEvent}", notification.GetType().Name);

        var course = notification.Item;
        var courseId = course.Id;
        var instructorId = course.CreatedBy;

        // Notify instructor
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

        //embedding course
        _embeddingJobService.EnqueueCourseEmbedding(courseId);
    }
}
