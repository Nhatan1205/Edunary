namespace Edunary.Application.AssignmentSubmissions.Queries.GetStudentSubmissionQuery;

public class StudentSubmissionDto
{
    public int SubmissionId { get; set; }
    public int AssignmentId { get; set; }
    public string AssignmentTitle { get; set; } = string.Empty;
    public DateTimeOffset SubmittedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<SubmissionAnswerDto> Answers { get; set; } = new();
    public List<FeedbackDto> Feedbacks { get; set; } = new();
}

public class SubmissionAnswerDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string ExampleAnswer { get; set; } = string.Empty;
    public string StudentAnswer { get; set; } = string.Empty;
}

public class FeedbackDto
{
    public int FeedbackId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string InstructorId { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public string InstructorAvatar { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}
