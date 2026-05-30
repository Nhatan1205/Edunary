using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Commands.AcceptQualityIssueCommand;

public record AcceptQualityIssueCommand : IRequest<Result>
{
    public int IssueId { get; init; }
}

public class AcceptQualityIssueCommandHandler : IRequestHandler<AcceptQualityIssueCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ISender _sender;

    public AcceptQualityIssueCommandHandler(IApplicationDbContext context, ISender sender)
    {
        _context = context;
        _sender = sender;
    }

    public async Task<Result> Handle(AcceptQualityIssueCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var issue = await _context.QualityCheckIssues
                .Include(i => i.Report)
                .FirstOrDefaultAsync(i => i.Id == request.IssueId, cancellationToken);

            Guard.Against.NotFound(request.IssueId, issue);

            if (issue.AdminAction == QualityIssueStatus.Accepted)
            {
                return Result.Success(message: "Issue was already accepted.");
            }

            var courseId = issue.Report.CourseId;
            var submission = await _context.CourseReviewSubmissions
                .Where(s => s.CourseId == courseId && s.Status == ReviewSubmissionStatus.Pending)
                .OrderByDescending(s => s.Created)
                .FirstOrDefaultAsync(cancellationToken);

            if (submission == null)
            {
                return Result.Failure(new[] { "No pending review submission found for this course." });
            }

            var feedbackType = issue.Severity == QualityIssueSeverity.Critical
                ? ReviewFeedbackType.RequiredFix
                : ReviewFeedbackType.RecommendedImprovement;

            var content = $"<p>{issue.Description}</p><p><strong>Location:</strong> {issue.Location}</p>";

            var saveFeedbackCommand = new Edunary.Application.CourseReviews.Commands.SaveReviewFeedbackCommand.SaveReviewFeedbackCommand
            {
                CourseReviewSubmissionId = submission.Id,
                FeedbackType = feedbackType,
                Category = issue.Category,
                Content = content
            };

            var feedbackResult = await _sender.Send(saveFeedbackCommand, cancellationToken);

            if (!feedbackResult.Succeeded)
            {
                return Result.Failure(feedbackResult.Errors);
            }

            issue.AdminAction = QualityIssueStatus.Accepted;
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success(message: "Issue accepted and added to review feedback.");
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
