using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;

public class UpdateCourseProgressCommand : IRequest<Result>
{
    public int CourseId { get; init; }
    public string Progress { get; init; }
}
public class UpdateCourseProgressCommandHandler : IRequestHandler<UpdateCourseProgressCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCourseProgressCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdateCourseProgressCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var courseProgress = await _context.CourseProgress
            .FirstOrDefaultAsync(cp => cp.CourseId == request.CourseId && cp.StudentId == userId, cancellationToken);

        if (courseProgress != null && request.Progress != null)
        {
            courseProgress.Progress = request.Progress;
            await _context.SaveChangesAsync(cancellationToken);
        }
        return Result.Success();
    }
}
