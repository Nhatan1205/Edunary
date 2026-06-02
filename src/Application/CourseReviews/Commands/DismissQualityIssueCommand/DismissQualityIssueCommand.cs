using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Commands.DismissQualityIssueCommand;

public record DismissQualityIssueCommand : IRequest<Result>
{
    public int IssueId { get; init; }
}

public class DismissQualityIssueCommandHandler : IRequestHandler<DismissQualityIssueCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DismissQualityIssueCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DismissQualityIssueCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var issue = await _context.QualityCheckIssues
                .FirstOrDefaultAsync(i => i.Id == request.IssueId, cancellationToken);

            Guard.Against.NotFound(request.IssueId, issue);

            if (issue.AdminAction == QualityIssueStatus.Dismissed)
            {
                return Result.Success(message: "Issue was already dismissed.");
            }

            issue.AdminAction = QualityIssueStatus.Dismissed;

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success(message: "Issue dismissed successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
