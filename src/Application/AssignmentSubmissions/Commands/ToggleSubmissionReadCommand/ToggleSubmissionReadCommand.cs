using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.AssignmentSubmissions.Commands.ToggleSubmissionReadCommand;

public record ToggleSubmissionReadCommand : IRequest<Result>
{
    public int SubmissionId { get; init; }
    public bool IsRead { get; init; }
}

public class ToggleSubmissionReadCommandHandler : IRequestHandler<ToggleSubmissionReadCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ToggleSubmissionReadCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(ToggleSubmissionReadCommand request, CancellationToken cancellationToken)
    {
        AssignmentSubmission submission = await _context.AssignmentSubmissions
            .Include(s => s.Assignment)
                .ThenInclude(a => a.Course)
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, cancellationToken);

        if (submission == null)
        {
            return Result.Failure(new[] { "Submission not found." });
        }

        if (submission.Assignment.Course.CreatedBy != _currentUserService.UserId)
        {
            return Result.Failure(new[] { "Access denied." });
        }

        submission.IsRead = request.IsRead;
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
