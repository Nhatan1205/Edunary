using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Assignments.Commands.DeleteAssignmentCommand;

public record DeleteAssignmentCommand : IRequest<Result>
{
    public int AssignmentId { get; init; }
}

public class DeleteAssignmentCommandHandler : IRequestHandler<DeleteAssignmentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteAssignmentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(DeleteAssignmentCommand request, CancellationToken cancellationToken)
    {
        Assignment assignment = await _context.Assignments
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

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
