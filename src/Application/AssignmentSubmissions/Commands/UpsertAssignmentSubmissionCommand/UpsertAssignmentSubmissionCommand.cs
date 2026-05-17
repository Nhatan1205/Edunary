using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using System.Text.Json;

namespace Edunary.Application.AssignmentSubmissions.Commands.UpsertAssignmentSubmissionCommand;

/// <summary>
/// Upsert an assignment submission — either save as Draft or mark as Submitted.
/// Merges the previous SaveAssignmentDraftCommand + SubmitAssignmentCommand into one.
/// </summary>
public record UpsertAssignmentSubmissionCommand : IRequest<ReturnResult<int>>
{
    public int AssignmentId { get; init; }
    public List<SubmitAnswerDto> Answers { get; init; } = new();
    public string Action { get; init; } = "draft";
}

public class SubmitAnswerDto
{
    public int QuestionId { get; set; }
    public string AnswerText { get; set; } = string.Empty;
}

public class UpsertAssignmentSubmissionCommandHandler : IRequestHandler<UpsertAssignmentSubmissionCommand, ReturnResult<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotifyService _notifyService;
    private readonly IIdentityService _identityService;

    public UpsertAssignmentSubmissionCommandHandler(
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

    public async Task<ReturnResult<int>> Handle(UpsertAssignmentSubmissionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            string userId = _currentUserService.UserId;
            bool isSubmit = request.Action.Equals("submit", StringComparison.OrdinalIgnoreCase);

            var assignment = await _context.Assignments
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.Id == request.AssignmentId, cancellationToken);

            if (assignment == null)
            {
                return new ReturnResult<int> { Result = 0, Message = "Assignment not found." };
            }

            if (!assignment.IsPublished)
            {
                return new ReturnResult<int> { Result = 0, Message = "Assignment is not published." };
            }

            bool isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.CourseId == assignment.CourseId && e.StudentId == userId, cancellationToken);

            if (!isEnrolled)
            {
                return new ReturnResult<int> { Result = 0, Message = "You are not enrolled in this course." };
            }

            var existing = await _context.AssignmentSubmissions
                .FirstOrDefaultAsync(
                    s => s.AssignmentId == request.AssignmentId && s.StudentId == userId,
                    cancellationToken);

            if (existing != null && existing.Status == AssignmentSubmissionStatus.Submitted)
            {
                return new ReturnResult<int> { Result = existing.Id, Message = "Assignment already submitted." };
            }

            string answersJson = JsonSerializer.Serialize(
                request.Answers.Select(a => new { questionId = a.QuestionId, answerText = a.AnswerText }));

            int submissionId;
            if (existing == null)
            {
                var submission = new AssignmentSubmission
                {
                    AssignmentId = request.AssignmentId,
                    StudentId = userId,
                    Status = isSubmit ? AssignmentSubmissionStatus.Submitted : AssignmentSubmissionStatus.Draft,
                    IsRead = false,
                    Answers = answersJson
                };
                _context.AssignmentSubmissions.Add(submission);
                await _context.SaveChangesAsync(cancellationToken);
                submissionId = submission.Id;
            }
            else
            {
                existing.Answers = answersJson;
                existing.Status = isSubmit ? AssignmentSubmissionStatus.Submitted : AssignmentSubmissionStatus.Draft;
                await _context.SaveChangesAsync(cancellationToken);
                submissionId = existing.Id;
            }

            //// Notify instructor on final submit
            //if (isSubmit)
            //{
            //    string instructorId = assignment.Course.CreatedBy;
            //    var student = await _identityService.GetUserById(userId);
            //    string studentName = student?.FullName ?? "A student";

            //    await _notifyService.NotifyUserAsync(
            //        instructorId,
            //        "New Assignment Submission",
            //        $"{studentName} submitted assignment: {assignment.Title}",
            //        "assignment_submission",
            //        new { assignmentId = assignment.Id, submissionId },
            //        cancellationToken,
            //        assignment.CourseId);
            //}

            return new ReturnResult<int>
            {
                Result = submissionId,
                Message = isSubmit ? "Assignment submitted successfully." : "Draft saved."
            };
        }
        catch (Exception ex)
        {
            return new ReturnResult<int> { Result = 0, Message = $"An error occurred: {ex.Message}" };
        }
    }
}
