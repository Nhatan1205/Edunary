using System;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Common;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Domain.Events.Courses;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

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

    public UnpublishCourseCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(UnpublishCourseCommand request, CancellationToken cancellationToken)
    {
        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);

        Guard.Against.NotFound(request.CourseId, course);

        course.Status = CourseStatus.Unpublished;
        course.AddDomainEvent(new CourseUnpublishedEvent(course, request.Reason));

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(message: "Course unpublished successfully.");
    }
}
