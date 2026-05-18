using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.AssignmentSubmissions.Commands.DeleteAssignmentFeedbackCommand;

public record DeleteAssignmentFeedbackCommand : IRequest<Result>
{
    public int FeedbackId { get; init; }
}

public class DeleteAssignmentFeedbackCommandHandler : IRequestHandler<DeleteAssignmentFeedbackCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteAssignmentFeedbackCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(DeleteAssignmentFeedbackCommand request, CancellationToken cancellationToken)
    {
        var feedback = await _context.AssignmentFeedbacks
            .FirstOrDefaultAsync(f => f.Id == request.FeedbackId, cancellationToken);

        if (feedback == null)
        {
            return Result.Failure(new[] { "Feedback not found." });
        }

        if (feedback.CreatedBy != _currentUserService.UserId)
        {
            return Result.Failure(new[] { "Access denied." });
        }

        _context.AssignmentFeedbacks.Remove(feedback);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
