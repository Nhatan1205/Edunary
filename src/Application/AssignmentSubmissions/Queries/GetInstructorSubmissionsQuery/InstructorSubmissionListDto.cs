namespace Edunary.Application.AssignmentSubmissions.Queries.GetInstructorSubmissionsQuery;

public class InstructorSubmissionListDto
{
    public int SubmissionId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string StudentAvatar { get; set; } = string.Empty;
    public DateTimeOffset SubmittedAt { get; set; }
    public bool IsRead { get; set; }
    public int FeedbackCount { get; set; }
    public int AssignmentId { get; set; }
    public string AssignmentTitle { get; set; } = string.Empty;
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
}
