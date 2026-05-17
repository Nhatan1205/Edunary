using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Assignments.Queries.GetAssignmentByItemIdQuery;

public record GetAssignmentByItemIdQuery : IRequest<AssignmentDto>
{
    public int CourseId { get; init; }
    public string ItemId { get; init; } = string.Empty;
}

public class GetAssignmentByItemIdQueryHandler : IRequestHandler<GetAssignmentByItemIdQuery, AssignmentDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetAssignmentByItemIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<AssignmentDto> Handle(GetAssignmentByItemIdQuery request, CancellationToken cancellationToken)
    {
        string userId = _currentUserService.UserId;

        bool isEnrolled = await _context.Enrollments
            .AnyAsync(e => e.CourseId == request.CourseId && e.StudentId == userId, cancellationToken);

        var assignment = await _context.Assignments
            .Include(a => a.Questions.OrderBy(q => q.SortOrder))
            .Include(a => a.Course)
            .FirstOrDefaultAsync(
                a => a.CourseId == request.CourseId
                    && a.ItemId == request.ItemId
                    && (a.Course.CreatedBy == userId || isEnrolled),
                cancellationToken);

        if (assignment == null)
        {
            return null;
        }

        AssignmentDto dto = new AssignmentDto
        {
            Id = assignment.Id,
            Title = assignment.Title,
            Description = assignment.Description,
            Instructions = assignment.Instructions,
            EstimatedDurationMinutes = assignment.EstimatedDurationMinutes,
            CourseId = assignment.CourseId,
            ItemId = assignment.ItemId,
            IsPublished = assignment.IsPublished,
            Questions = assignment.Questions.Select(q => new AssignmentQuestionDto
            {
                Id = q.Id,
                QuestionText = q.QuestionText,
                ExampleAnswer = q.ExampleAnswer,
                SortOrder = q.SortOrder
            }).ToList()
        };

        // Student-specific: resolve submission status
        if (isEnrolled)
        {
            AssignmentSubmission submission = await _context.AssignmentSubmissions
                .Include(s => s.Feedbacks)
                .FirstOrDefaultAsync(s => s.AssignmentId == assignment.Id && s.StudentId == userId, cancellationToken);

            if (submission == null)
            {
                dto.SubmissionStatus = "not_started";
            }
            else if (submission.Status == AssignmentSubmissionStatus.Draft)
            {
                dto.SubmissionStatus = "draft";
                dto.SubmissionId = submission.Id;
            }
            else if (submission.Feedbacks.Any())
            {
                dto.SubmissionStatus = "feedback_received";
                dto.SubmissionId = submission.Id;
            }
            else
            {
                dto.SubmissionStatus = "submitted";
                dto.SubmissionId = submission.Id;
            }
        }

        return dto;
    }
}
