using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.CourseProgresses.Commands.CreateCourseProgressCommand;

public class CreateCourseProgressCommand : IRequest<Result>
{
    public int CourseId { get; init; }
    public string Progress { get; init; }
}
public class CreateCourseProgressCommandHandler : IRequestHandler<CreateCourseProgressCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateCourseProgressCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(CreateCourseProgressCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var courseProgress = new CourseProgress
        {
            CourseId = request.CourseId,
            StudentId = userId,
            Progress = request.Progress
        };

        _context.CourseProgress.Add(courseProgress);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
