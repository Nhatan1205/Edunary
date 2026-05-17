namespace Edunary.Application.Assignments.Queries.GetAssignmentsByCourseQuery;

public class AssignmentSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ItemId { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public int QuestionCount { get; set; }
}
