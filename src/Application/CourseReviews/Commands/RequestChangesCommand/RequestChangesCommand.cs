using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Edunary.Domain.Events.CourseReviews;
using Microsoft.EntityFrameworkCore;
using Edunary.Domain.Common;

using Edunary.Application.Common.Behaviours;

namespace Edunary.Application.CourseReviews.Commands.RequestChangesCommand;

[ActivityLog(ActivityType.RequestCourseChanges, "Request Course Changes")]
public record RequestChangesCommand : IRequest<Result>
{
    public int SubmissionId { get; init; }
    public string AdminNote { get; init; }
}

public class RequestChangesCommandHandler : IRequestHandler<RequestChangesCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public RequestChangesCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
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

        submission.AddDomainEvent(new CourseReviewChangesRequestedEvent(submission, request.AdminNote));

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(message: "Changes requested successfully.");
    }
}
