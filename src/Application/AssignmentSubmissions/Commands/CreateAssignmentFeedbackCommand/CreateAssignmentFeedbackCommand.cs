using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.AssignmentSubmissions.Commands.CreateAssignmentFeedbackCommand;

public record CreateAssignmentFeedbackCommand : IRequest<ReturnResult<int>>
{
    public int SubmissionId { get; init; }
    public string Content { get; init; } = string.Empty;
}

public class CreateAssignmentFeedbackCommandHandler : IRequestHandler<CreateAssignmentFeedbackCommand, ReturnResult<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotifyService _notifyService;
    private readonly IIdentityService _identityService;

    public CreateAssignmentFeedbackCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        INotifyService notifyService,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _notifyService = notifyService;
        _identityService = identityService;
    }

    public async Task<ReturnResult<int>> Handle(CreateAssignmentFeedbackCommand request, CancellationToken cancellationToken)
    {
        try
        {
            string userId = _currentUserService.UserId;

            var submission = await _context.AssignmentSubmissions
                .Include(s => s.Assignment)
                    .ThenInclude(a => a.Course)
                .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, cancellationToken);

            if (submission == null)
            {
                return new ReturnResult<int> { Result = 0, Message = "Submission not found." };
            }

            if (submission.Assignment.Course.CreatedBy != userId)
            {
                return new ReturnResult<int> { Result = 0, Message = "Access denied." };
            }

            if (submission.Status != AssignmentSubmissionStatus.Submitted)
            {
                return new ReturnResult<int> { Result = 0, Message = "Cannot feedback a draft submission." };
            }

            AssignmentFeedback feedback = new AssignmentFeedback
            {
                AssignmentSubmissionId = submission.Id,
                Content = request.Content
            };

            _context.AssignmentFeedbacks.Add(feedback);

            await _context.SaveChangesAsync(cancellationToken);

            // Notify student
            //var instructor = await _identityService.GetUserById(userId);
            //string instructorName = instructor?.FullName ?? "Your instructor";

            //await _notifyService.NotifyUserAsync(
            //    submission.StudentId,
            //    "Assignment Feedback Received",
            //    $"{instructorName} gave feedback on your assignment: {submission.Assignment.Title}",
            //    "assignment_feedback",
            //    new { assignmentId = submission.AssignmentId, submissionId = submission.Id },
            //    cancellationToken,
            //    submission.Assignment.CourseId);

            return new ReturnResult<int> { Result = feedback.Id, Message = "Feedback submitted successfully." };
        }
        catch (Exception ex)
        {
            return new ReturnResult<int> { Result = 0, Message = $"An error occurred: {ex.Message}" };
        }
    }
}
