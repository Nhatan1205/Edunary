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

public class CourseUnpublishedEventHandler : INotificationHandler<CourseUnpublishedEvent>
{
    private readonly ILogger<CourseUnpublishedEventHandler> _logger;
    private readonly INotifyService _notifyService;
    private readonly IEmailService _emailService;
    private readonly IIdentityService _identityService;
    private readonly AppSettings _appSettings;
    private readonly ICourseEmbeddingJobService _embeddingJobService;
    private readonly ICourseCurriculumEmbeddingJobService _curriculumEmbeddingJobService;

    public CourseUnpublishedEventHandler(
        ILogger<CourseUnpublishedEventHandler> logger,
        INotifyService notifyService,
        IEmailService emailService,
        IIdentityService identityService,
        IOptions<AppSettings> appSettings,
        ICourseEmbeddingJobService embeddingJobService,
        ICourseCurriculumEmbeddingJobService curriculumEmbeddingJobService)
    {
        _logger = logger;
        _notifyService = notifyService;
        _emailService = emailService;
        _identityService = identityService;
        _appSettings = appSettings.Value;
        _embeddingJobService = embeddingJobService;
        _curriculumEmbeddingJobService = curriculumEmbeddingJobService;
    }

    public async Task Handle(CourseUnpublishedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Edunary Domain Event: {DomainEvent}", notification.GetType().Name);

        var course = notification.Item;
        var instructorId = course.CreatedBy;

        // Notify instructor via SignalR
        await _notifyService.NotifyUserAsync(
            instructorId,
            $"Your course \"{course.Title}\" has been unpublished by the admin",
            $"Reason: {notification.Reason}",
            "course_unpublished",
            new { courseId = course.Id },
            cancellationToken,
            courseId: course.Id,
            url: $"/instructor/course/{course.Id}/manage",
            imageUrl: course.ImageUrl ?? string.Empty);

        // Notify instructor via email
        var instructor = await _identityService.GetUserById(instructorId);
        if (instructor != null && !string.IsNullOrEmpty(instructor.Email))
        {
            var courseUrl = $"{_appSettings.ClientUrl}/instructor/course/{course.Id}/manage";
            var html = EmailTemplates.BuildCourseUnpublishedTemplate(
                instructor.FullName ?? instructor.Email,
                course.Title,
                notification.Reason,
                courseUrl);

            await _emailService.SendBulkEmailsAsync(
                new[] { instructor.Email },
                $"Your course \"{course.Title}\" has been unpublished",
                html);
        }

        //delete embedding
        _embeddingJobService.EnqueueCourseEmbeddingDeletion(course.Id);
    }
}
