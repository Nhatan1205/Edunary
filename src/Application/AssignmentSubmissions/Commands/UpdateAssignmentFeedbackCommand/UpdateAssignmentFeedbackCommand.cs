using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.AssignmentSubmissions.Commands.UpdateAssignmentFeedbackCommand;

public record UpdateAssignmentFeedbackCommand : IRequest<Result>
{
    public int FeedbackId { get; init; }
    public string Content { get; init; } = string.Empty;
}

public class UpdateAssignmentFeedbackCommandHandler : IRequestHandler<UpdateAssignmentFeedbackCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateAssignmentFeedbackCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdateAssignmentFeedbackCommand request, CancellationToken cancellationToken)
    {
        AssignmentFeedback feedback = await _context.AssignmentFeedbacks
            .FirstOrDefaultAsync(f => f.Id == request.FeedbackId, cancellationToken);

        if (feedback == null)
        {
            return Result.Failure(new[] { "Feedback not found." });
        }

        if (feedback.CreatedBy != _currentUserService.UserId)
        {
            return Result.Failure(new[] { "Access denied." });
        }

        feedback.Content = request.Content;
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
