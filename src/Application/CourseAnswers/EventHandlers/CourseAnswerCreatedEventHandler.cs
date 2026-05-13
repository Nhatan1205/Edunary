using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Common;
using Edunary.Domain.Events.CourseAnswers;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Edunary.Application.CourseAnswers.EventHandlers;

public class CourseAnswerCreatedEventHandler : INotificationHandler<CourseAnswerCreatedEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly INotifyService _notifyService;
    private readonly IEmailService _emailService;
    private readonly AppSettings _appSettings;

    public CourseAnswerCreatedEventHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        INotifyService notifyService,
        IEmailService emailService,
        IOptions<AppSettings> appSettings)
    {
        _context = context;
        _identityService = identityService;
        _notifyService = notifyService;
        _emailService = emailService;
        _appSettings = appSettings.Value;
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
        var answerOwner = await _identityService.GetUserById(answer.CreatedBy);
        var answerOwnerName = answerOwner?.FullName ?? "Someone";
        var answerOwnerAvatar = answerOwner?.Avatar ?? string.Empty;

        await _notifyService.NotifyUserAsync(
            questionOwnerId,
            $"{answerOwnerName} replied to the question:",
            question.Title,
            "qa_new_answer",
            new { questionId = question.Id, courseId = question.CourseId },
            cancellationToken,
            0,
            $"/course/{question.CourseId}/learn/lecture/item-1?tab=qa",
            answerOwnerAvatar);

        // 4. Send email
        var questionOwner = await _identityService.GetUserById(questionOwnerId);
        var ownerEmail = questionOwner?.Email;

        if (!string.IsNullOrWhiteSpace(ownerEmail))
        {
            var subject = isInstructorAnswer
                ? $"The instructor answered your question"
                : $"Your question got an answer!";

            var actionUrl = $"{_appSettings.ClientUrl}/course/{question.CourseId}/learn/lecture/item-1?tab=qa";
            var html = EmailTemplates.BuildNewAnswerTemplate(courseName, question.Title, isInstructorAnswer, actionUrl);
            await _emailService.SendBulkEmailsAsync(new[] { ownerEmail }, subject, html);
        }
    }
}
