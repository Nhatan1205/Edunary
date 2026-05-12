using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseAnswers.Commands.UpdateCourseAnswerCommand;

public record UpdateCourseAnswerCommand : IRequest<Result>
{
    public int AnswerId { get; init; }
    public string Body { get; init; } = string.Empty;
}

public class UpdateCourseAnswerCommandHandler : IRequestHandler<UpdateCourseAnswerCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCourseAnswerCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(
        UpdateCourseAnswerCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var answer = await _context.CourseAnswers
                .FindAsync(new object[] { request.AnswerId }, cancellationToken);

            Guard.Against.NotFound(request.AnswerId, answer);

            var userId = _currentUserService.UserId;

            // Only the original author can edit
            if (answer.CreatedBy != userId)
            {
                return Result.Failure("Only the author can edit this answer.");
            }

            answer.Body = request.Body;

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success("Answer updated.");
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
