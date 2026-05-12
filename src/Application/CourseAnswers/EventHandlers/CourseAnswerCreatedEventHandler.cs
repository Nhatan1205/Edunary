using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Events.CourseAnswers;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseAnswers.EventHandlers;

public class CourseAnswerCreatedEventHandler : INotificationHandler<CourseAnswerCreatedEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly INotifyService _notifyService;
    private readonly IEmailService _emailService;

    public CourseAnswerCreatedEventHandler(
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

    public async Task Handle(CourseAnswerCreatedEvent notification, CancellationToken cancellationToken)
    {
        var answer = notification.Item;
        var question = answer.Question;
        if (question == null)
        {
            return;
        }

        var questionOwnerId = question.CreatedBy;
        var courseName = question.Course?.Title ?? string.Empty;
        var isInstructorAnswer = answer.CreatedBy == question.Course?.CreatedBy;

        // 1. Skip if answerer is the question owner
        if (answer.CreatedBy == questionOwnerId)
        {
            return;
        }

        // 2. Notify on first answer or when instructor answers
        var isFirstAnswer = question.AnswerCount <= 1;

        if (!isFirstAnswer && !isInstructorAnswer)
        {
            return;
        }

        // 3. Send notification to question owner
        var notifTitle = isInstructorAnswer
            ? $"The instructor answered your question"
            : $"Your question received its first answer";

        var notifMessage = $"\"{question.Title}\"";

        await _notifyService.NotifyUserAsync(
            questionOwnerId,
            notifTitle,
            notifMessage,
            "qa_new_answer",
            new { questionId = question.Id, courseId = question.CourseId },
            cancellationToken,
            0,
            $"/course/{question.CourseId}/learn");

        // 4. Send email
        var questionOwner = await _identityService.GetUserById(questionOwnerId);
        var ownerEmail = questionOwner?.Email;

        if (!string.IsNullOrWhiteSpace(ownerEmail))
        {
            var subject = isInstructorAnswer
                ? $"The instructor answered your question"
                : $"Your question got an answer!";

            var actionUrl = $"https://localhost:44447/course/{question.CourseId}/learn";
            var html = EmailTemplates.BuildNewAnswerTemplate(courseName, question.Title, isInstructorAnswer, actionUrl);
            _emailService.EnqueueEmailAsync(ownerEmail, subject, html);
        }
    }
}
