using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Commands.AcceptQualityIssueCommand;

public record AcceptQualityIssueCommand : IRequest<Result>
{
    public int IssueId { get; init; }
    public string EditedContent { get; init; }
}

public class AcceptQualityIssueCommandHandler : IRequestHandler<AcceptQualityIssueCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public AcceptQualityIssueCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(AcceptQualityIssueCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var issue = await _context.QualityCheckIssues
                .FirstOrDefaultAsync(i => i.Id == request.IssueId, cancellationToken);

            Guard.Against.NotFound(request.IssueId, issue);

            if (issue.AdminAction == QualityIssueStatus.Accepted)
            {
                return Result.Success(message: "Issue was already accepted.");
            }

            issue.AdminAction = QualityIssueStatus.Accepted;

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success(message: "Issue accepted successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
