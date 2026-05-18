using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Domain.Events.AssignmentSubmissions;

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
    private readonly ICourseAuthorizationService _courseAuth;

    public CreateAssignmentFeedbackCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<ReturnResult<int>> Handle(CreateAssignmentFeedbackCommand request, CancellationToken cancellationToken)
    {
        try
        {
            string userId = _currentUserService.UserId;

            var submission = await _context.AssignmentSubmissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, cancellationToken);

            if (submission == null)
                return new ReturnResult<int> { Result = 0, Message = "Submission not found." };

            bool canAccess = await _courseAuth.HasCourseAccessAsync(submission.Assignment.CourseId, userId, CoursePermission.Assignments, cancellationToken);
            if (!canAccess)
                return new ReturnResult<int> { Result = 0, Message = "Access denied." };

            if (submission.Status != AssignmentSubmissionStatus.Submitted)
                return new ReturnResult<int> { Result = 0, Message = "Cannot feedback a draft submission." };

            AssignmentFeedback feedback = new AssignmentFeedback
            {
                AssignmentSubmissionId = submission.Id,
                Content = request.Content
            };

            _context.AssignmentFeedbacks.Add(feedback);

            await _context.SaveChangesAsync(cancellationToken);

            feedback.AddDomainEvent(new AssignmentFeedbackCreatedEvent(feedback, submission));
            await _context.SaveChangesAsync(cancellationToken);

            return new ReturnResult<int> { Result = feedback.Id, Message = "Feedback submitted successfully." };
        }
        catch (Exception ex)
        {
            return new ReturnResult<int> { Result = 0, Message = $"An error occurred: {ex.Message}" };
        }
    }
}
