using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Assignments.Commands.UpdateAssignmentCommand;

public record UpdateAssignmentCommand : IRequest<Result>
{
    public int AssignmentId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Instructions { get; init; } = string.Empty;
    public int EstimatedDurationMinutes { get; init; }
}

public class UpdateAssignmentCommandHandler : IRequestHandler<UpdateAssignmentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateAssignmentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdateAssignmentCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _context.Assignments
            .Include(a => a.Course)
            .FirstOrDefaultAsync(a => a.Id == request.AssignmentId, cancellationToken);

        if (assignment == null)
        {
            return Result.Failure(new[] { "Assignment not found." });
        }

        if (assignment.Course.CreatedBy != _currentUserService.UserId)
        {
            return Result.Failure(new[] { "Access denied." });
        }

        assignment.Title = request.Title;
        assignment.Description = request.Description;
        assignment.Instructions = request.Instructions;
        assignment.EstimatedDurationMinutes = request.EstimatedDurationMinutes;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
