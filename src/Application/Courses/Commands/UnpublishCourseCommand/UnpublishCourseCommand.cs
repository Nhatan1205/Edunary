using System;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Common;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Edunary.Application.Courses.Commands.UnpublishCourseCommand;

public record UnpublishCourseCommand : IRequest<Result>
{
    public int CourseId { get; init; }
    public string Reason { get; init; }
}

// For admin only
public class UnpublishCourseCommandValidator : AbstractValidator<UnpublishCourseCommand>
{
    public UnpublishCourseCommandValidator()
    {
        RuleFor(x => x.CourseId)
            .GreaterThan(0)
            .WithMessage("CourseId must be greater than 0.");

        RuleFor(x => x.Reason)
            .NotEmpty()
            .WithMessage("Reason is required.")
            .MinimumLength(10)
            .WithMessage("Reason must be at least 10 characters long.");
    }
}

public class UnpublishCourseCommandHandler : IRequestHandler<UnpublishCourseCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly INotifyService _notifyService;
    private readonly IEmailService _emailService;
    private readonly IIdentityService _identityService;
    private readonly AppSettings _appSettings;

    public UnpublishCourseCommandHandler(
        IApplicationDbContext context,
        INotifyService notifyService,
        IEmailService emailService,
        IIdentityService identityService,
        IOptions<AppSettings> appSettings)
    {
        _context = context;
        _notifyService = notifyService;
        _emailService = emailService;
        _identityService = identityService;
        _appSettings = appSettings.Value;
    }

    public async Task<Result> Handle(UnpublishCourseCommand request, CancellationToken cancellationToken)
    {
        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);

        Guard.Against.NotFound(request.CourseId, course);

        if (course.Status != CourseStatus.Public)
        {
            return Result.Failure("Only public (published) courses can be unpublished.");
        }

        course.Status = CourseStatus.Unpublished;
        await _context.SaveChangesAsync(cancellationToken);

        var instructorId = course.CreatedBy;

        // Notify instructor via SignalR
        await _notifyService.NotifyUserAsync(
            instructorId,
            "Your course \"{course.Title}\" has been unpublished by the admin",
            $"Reason: {request.Reason}",
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
                request.Reason,
                courseUrl);

            await _emailService.SendBulkEmailsAsync(
                new[] { instructor.Email },
                $"Your course \"{course.Title}\" has been unpublished",
                html);
        }

        return Result.Success(message: "Course unpublished successfully.");
    }
}
