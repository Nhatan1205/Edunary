using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Assignments.Commands.UpdateAssignmentQuestionsCommand;

public record UpdateAssignmentQuestionsCommand : IRequest<Result>
{
    public int AssignmentId { get; init; }
    public List<AssignmentQuestionDto> Questions { get; init; } = new();
}

public class UpdateAssignmentQuestionsCommandHandler : IRequestHandler<UpdateAssignmentQuestionsCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public UpdateAssignmentQuestionsCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(UpdateAssignmentQuestionsCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _context.Assignments
            .Include(a => a.Questions)
            .FirstOrDefaultAsync(a => a.Id == request.AssignmentId, cancellationToken);

        if (assignment == null)
            return Result.Failure(new[] { "Assignment not found." });

        bool canManage = await _courseAuth.HasCourseAccessAsync(assignment.CourseId, _currentUserService.UserId, CoursePermission.Manage, cancellationToken);
        if (!canManage)
            return Result.Failure(new[] { "Access denied." });

        HashSet<int> incomingIds = request.Questions
            .Where(q => q.Id.HasValue)
            .Select(q => q.Id!.Value)
            .ToHashSet();

        List<AssignmentQuestion> toDelete = assignment.Questions
            .Where(q => !incomingIds.Contains(q.Id))
            .ToList();

        _context.AssignmentQuestions.RemoveRange(toDelete);

        foreach (AssignmentQuestionDto qDto in request.Questions)
        {
            if (qDto.Id.HasValue)
            {
                AssignmentQuestion existing = assignment.Questions.First(q => q.Id == qDto.Id.Value);
                existing.QuestionText = qDto.QuestionText;
                existing.ExampleAnswer = qDto.ExampleAnswer;
                existing.SortOrder = qDto.SortOrder;
            }
            else
            {
                _context.AssignmentQuestions.Add(new AssignmentQuestion
                {
                    AssignmentId = assignment.Id,
                    QuestionText = qDto.QuestionText,
                    ExampleAnswer = qDto.ExampleAnswer,
                    SortOrder = qDto.SortOrder
                });
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
