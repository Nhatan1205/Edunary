using Edunary.Application.Common.Interfaces;
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
    private readonly IIdentityService _identityService;
    private readonly ICourseAuthorizationService _courseAuth;

    public GetAssignmentByItemIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
        _courseAuth = courseAuth;
    }

    public async Task<AssignmentDto> Handle(GetAssignmentByItemIdQuery request, CancellationToken cancellationToken)
    {
        string userId = _currentUserService.UserId;

        bool isEnrolled = await _context.Enrollments
            .AnyAsync(e => e.CourseId == request.CourseId && e.StudentId == userId, cancellationToken);

        bool isInstructor = await _courseAuth.HasCourseAccessAsync(request.CourseId, userId, CoursePermission.None, cancellationToken);

        var assignment = await _context.Assignments
            .Include(a => a.Questions.OrderBy(q => q.SortOrder))
            .Include(a => a.Course)
            .FirstOrDefaultAsync(
                a => a.CourseId == request.CourseId
                    && a.ItemId == request.ItemId
                    && (isInstructor || isEnrolled),
                cancellationToken);

        if (assignment == null) return null;

        // Students can only see published assignments
        if (!isInstructor && !assignment.IsPublished) return null;

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

        // Resolve instructor info only
        string instructorId = assignment.Course.CreatedBy;

        var instructor = await _identityService.GetUserById(instructorId);
        dto.InstructorId = instructorId;
        dto.InstructorName = instructor?.FullName ?? "Instructor";
        dto.InstructorAvatar = instructor?.Avatar ?? string.Empty;

        if (isEnrolled)
        {
            var submission = await _context.AssignmentSubmissions
                .FirstOrDefaultAsync(
                    s => s.AssignmentId == assignment.Id && s.StudentId == userId,
                    cancellationToken);

            if (submission != null)
            {
                dto.SubmissionStatus = (int)submission.Status; 
                dto.SubmissionId = submission.Id;
            }
            
        }

        return dto;
    }
}
