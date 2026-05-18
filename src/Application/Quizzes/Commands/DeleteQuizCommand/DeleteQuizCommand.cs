using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Quizzes.Commands.DeleteQuizCommand;

public record DeleteQuizCommand : IRequest<Result>
{
    public List<int> QuizIds { get; init; } = new();
}

public class DeleteQuizCommandHandler : IRequestHandler<DeleteQuizCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public DeleteQuizCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(DeleteQuizCommand request, CancellationToken cancellationToken)
    {
        if (request.QuizIds == null || request.QuizIds.Count == 0)
            return Result.Success();

        var quizzes = await _context.Quizzes
            .Where(q => request.QuizIds.Contains(q.Id))
            .ToListAsync(cancellationToken);

        // Check manage permission per distinct courseId
        var courseIds = quizzes.Select(q => q.CourseId).Distinct();
        foreach (var courseId in courseIds)
        {
            bool canManage = await _courseAuth.HasCourseAccessAsync(courseId, _currentUserService.UserId, CoursePermission.Manage, cancellationToken);
            if (!canManage)
                return Result.Failure(new[] { "Access denied." });
        }

        _context.Quizzes.RemoveRange(quizzes); // Cascade deletes Questions, Choices, Snapshots
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
