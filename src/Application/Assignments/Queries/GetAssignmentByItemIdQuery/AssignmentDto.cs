namespace Edunary.Application.Assignments.Queries.GetAssignmentByItemIdQuery;

public class AssignmentDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public int EstimatedDurationMinutes { get; set; }
    public int CourseId { get; set; }
    public string ItemId { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public List<AssignmentQuestionDto> Questions { get; set; } = new();
    public string InstructorId { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public string InstructorAvatar { get; set; } = string.Empty;
    public int? SubmissionStatus { get; set; }  
    public int? SubmissionId { get; set; }
}

public class AssignmentQuestionDto
{
    public int Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string ExampleAnswer { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
