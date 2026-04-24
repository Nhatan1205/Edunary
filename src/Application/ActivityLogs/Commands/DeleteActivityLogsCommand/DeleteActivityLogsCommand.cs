using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.ActivityLogs.Commands.DeleteActivityLogsCommand;

public record DeleteActivityLogsCommand : IRequest<Result>
{
    public List<int> Ids { get; init; }
}

public class DeleteActivityLogsCommandHandler : IRequestHandler<DeleteActivityLogsCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteActivityLogsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteActivityLogsCommand request, CancellationToken cancellationToken)
    {
        if (request.Ids == null || !request.Ids.Any())
            return Result.Failure(new[] { "No IDs provided." });

        var deleted = await _context.ActivityLogs
            .Where(l => request.Ids.Contains(l.Id))
            .ExecuteDeleteAsync(cancellationToken);

        return deleted > 0
            ? Result.Success()
            : Result.Failure(new[] { "No matching activity logs found." });
    }
}
