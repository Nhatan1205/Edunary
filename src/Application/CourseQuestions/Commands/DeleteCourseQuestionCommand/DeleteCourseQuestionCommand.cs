using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseQuestions.Commands.DeleteCourseQuestionCommand;

public record DeleteCourseQuestionCommand : IRequest<Result>
{
    public int QuestionId { get; init; }
}

public class DeleteCourseQuestionCommandHandler : IRequestHandler<DeleteCourseQuestionCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public DeleteCourseQuestionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(
        DeleteCourseQuestionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var question = await _context.CourseQuestions
                .FindAsync(new object[] { request.QuestionId }, cancellationToken);

            Guard.Against.NotFound(request.QuestionId, question);

            var userId = _currentUserService.UserId;

            // Author (student) OR instructor/QA collaborator can delete
            var hasInstructorAccess = await _courseAuth.HasCourseAccessAsync(
                question.CourseId, userId, CoursePermission.QA, cancellationToken);

            if (question.CreatedBy != userId && !hasInstructorAccess)
            {
                return Result.Failure("Not authorized to delete this question.");
            }

            _context.CourseQuestions.Remove(question);
            var result = await _context.SaveChangesAsync(cancellationToken);

            return result > 0
                ? Result.Success("Question deleted.")
                : Result.Failure("Failed to delete question.");
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
