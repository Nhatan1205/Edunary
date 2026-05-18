using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using System.Text.Json;

namespace Edunary.Application.AssignmentSubmissions.Queries.GetStudentSubmissionQuery;

public record GetStudentSubmissionQuery : IRequest<StudentSubmissionDto>
{
    public int SubmissionId { get; init; }
}

public class GetStudentSubmissionQueryHandler : IRequestHandler<GetStudentSubmissionQuery, StudentSubmissionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;
    private readonly ICourseAuthorizationService _courseAuth;

    public GetStudentSubmissionQueryHandler(
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

    public async Task<StudentSubmissionDto> Handle(GetStudentSubmissionQuery request, CancellationToken cancellationToken)
    {
        string userId = _currentUserService.UserId;

        var submission = await _context.AssignmentSubmissions
            .Include(s => s.Assignment)
                .ThenInclude(a => a.Course)
            .Include(s => s.Assignment)
                .ThenInclude(a => a.Questions.OrderBy(q => q.SortOrder))
            .Include(s => s.Feedbacks.OrderBy(f => f.Created))
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, cancellationToken);

        if (submission == null)
        {
            return null;
        }

        // check access: only student owns submission OR instructor has Assignments permission
        bool isStudent = submission.StudentId == userId;
        bool isInstructor = false;
        
        if (!isStudent)
        {
            isInstructor = await _courseAuth.HasCourseAccessAsync(submission.Assignment.CourseId, userId, CoursePermission.Assignments, cancellationToken);
        }

        if (!isStudent && !isInstructor)
        {
            return null;
        }

        // Deserialize answers JSON
        List<AnswerItem> answers = new List<AnswerItem>();
        if (!string.IsNullOrEmpty(submission.Answers))
        {
            answers = JsonSerializer.Deserialize<List<AnswerItem>>(
                submission.Answers,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<AnswerItem>();
        }

        // Join answers with questions
        List<SubmissionAnswerDto> answerDtos = submission.Assignment.Questions.Select(q =>
        {
            AnswerItem matched = answers.FirstOrDefault(a => a.QuestionId == q.Id);
            return new SubmissionAnswerDto
            {
                QuestionId = q.Id,
                QuestionText = q.QuestionText,
                ExampleAnswer = q.ExampleAnswer,
                StudentAnswer = matched?.AnswerText ?? string.Empty
            };
        }).ToList();

        List<FeedbackDto> feedbackDtos = new List<FeedbackDto>();
        if (submission.Feedbacks.Any())
        {
            var instructorIds = submission.Feedbacks
                .Select(fb => fb.CreatedBy)
                .Distinct()
                .ToList();

            var instructors = await _identityService.GetUserIdentitiesByIdsAsync(instructorIds, cancellationToken);
            var instructorDict = instructors.ToDictionary(u => u.Id);

            foreach (var fb in submission.Feedbacks)
            {
                instructorDict.TryGetValue(fb.CreatedBy, out var instructor);
                feedbackDtos.Add(new FeedbackDto
                {
                    FeedbackId = fb.Id,
                    Content = fb.Content,
                    InstructorId = fb.CreatedBy,
                    InstructorName = instructor?.FullName ?? "Instructor",
                    InstructorAvatar = instructor?.Avatar ?? string.Empty,
                    CreatedAt = fb.Created
                });
            }
        }

        return new StudentSubmissionDto
        {
            SubmissionId = submission.Id,
            AssignmentId = submission.AssignmentId,
            AssignmentTitle = submission.Assignment.Title,
            SubmittedAt = submission.Created,
            Status = submission.Status.ToString(),
            Answers = answerDtos,
            Feedbacks = feedbackDtos
        };
    }
}

// Internal model for JSON deserialization
internal class AnswerItem
{
    public int QuestionId { get; set; }
    public string AnswerText { get; set; } = string.Empty;
}
