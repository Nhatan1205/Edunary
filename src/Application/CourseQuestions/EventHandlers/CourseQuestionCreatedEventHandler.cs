using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Events.CourseQuestions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseQuestions.EventHandlers;

public class CourseQuestionCreatedEventHandler : INotificationHandler<CourseQuestionCreatedEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly INotifyService _notifyService;
    private readonly IEmailService _emailService;

    public CourseQuestionCreatedEventHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        INotifyService notifyService,
        IEmailService emailService)
    {
        _context = context;
        _identityService = identityService;
        _notifyService = notifyService;
        _emailService = emailService;
    }

    public async Task Handle(CourseQuestionCreatedEvent notification, CancellationToken cancellationToken)
    {
        var question = notification.Item;

        // 1. Get instructor of the course
        var course = await _context.Courses
            .Where(c => c.Id == question.CourseId)
            .Select(c => new { c.CreatedBy, c.Title })
            .FirstOrDefaultAsync(cancellationToken);

        if (course == null)
        {
            return;
        }

        var instructorId = course.CreatedBy;
        var courseName = course.Title;

        // 2. Skip if the instructor asked the question themselves
        if (question.CreatedBy == instructorId)
        {
            return;
        }

        // 3. Cooldown check: skip if we already sent a notification for this course in the last 24 hours
        var cutoff = DateTimeOffset.UtcNow.AddHours(-24);
        var alreadyNotified = await _context.NotificationUsers
            .Include(nu => nu.Notification)
            .AnyAsync(
                nu => nu.StudentId == instructorId
                    && nu.Notification.Type == "qa_new_question"
                    && nu.Notification.CourseId == question.CourseId
                    && nu.Notification.Created >= cutoff,
                cancellationToken);

        if (alreadyNotified)
        {
            return;
        }

        // 4. Send in-app notification
        await _notifyService.NotifyUserAsync(
            instructorId,
            $"You have a new question in \"{courseName}\"",
            $"A student asked: \"{question.Title}\"",
            "qa_new_question",
            new { questionId = question.Id, courseId = question.CourseId },
            cancellationToken,
            question.CourseId,
            "/instructor/communication/qa");


        // 5. Send email via Hangfire (fire-and-forget, non-blocking)
        var instructor = await _identityService.GetUserById(instructorId);
        var instructorEmail = instructor?.Email;

        if (!string.IsNullOrWhiteSpace(instructorEmail))
        {
            var subject = $"New student question in \"{courseName}\"";
            var actionUrl = "https://localhost:44447/instructor/communication/qa";
            var html = EmailTemplates.BuildNewQuestionTemplate(courseName, question.Title, actionUrl);
            _emailService.EnqueueEmailAsync(instructorEmail, subject, html);
        }
    }
}
