using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Quizzes.Commands.LinkQuizToItemCommand;

/// <summary>Links an existing quiz to a curriculum item (sets ItemId) and optionally sets RelatedItemId.</summary>
public record LinkQuizToItemCommand : IRequest<Result>
{
    public int QuizId { get; init; }
    public int CourseId { get; init; }
    public string NewItemId { get; init; } = string.Empty;
#nullable enable
    public string? RelatedItemId { get; init; }
#nullable disable
}

public class LinkQuizToItemCommandHandler : IRequestHandler<LinkQuizToItemCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public LinkQuizToItemCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(LinkQuizToItemCommand request, CancellationToken cancellationToken)
    {
        Quiz quiz = await _context.Quizzes
            .Include(q => q.Course)
            .FirstOrDefaultAsync(q => q.Id == request.QuizId && q.CourseId == request.CourseId, cancellationToken);

        if (quiz == null)
            return Result.Failure(new[] { "Quiz not found." });

        var userId = _currentUserService?.UserId;
        if (string.IsNullOrEmpty(userId))
            return Result.Failure(new[] { "User is not authenticated." });

        bool canManage = await _courseAuth.HasCourseAccessAsync(request.CourseId, userId, Domain.Enums.CoursePermission.Manage, cancellationToken);
        if (!canManage)
            return Result.Failure(new[] { "You do not have Manage permissions for this course." });

        quiz.ItemId = request.NewItemId;
        quiz.RelatedItemId = request.RelatedItemId;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
