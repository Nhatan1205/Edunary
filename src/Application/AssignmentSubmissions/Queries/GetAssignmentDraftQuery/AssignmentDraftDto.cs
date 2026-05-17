namespace Edunary.Application.AssignmentSubmissions.Queries.GetAssignmentDraftQuery;

public class AssignmentDraftDto
{
    public int SubmissionId { get; set; }
    public Dictionary<int, string> Answers { get; set; } = new();
}
