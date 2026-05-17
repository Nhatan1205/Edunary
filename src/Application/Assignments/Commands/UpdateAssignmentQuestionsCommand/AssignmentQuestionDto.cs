namespace Edunary.Application.Assignments.Commands.UpdateAssignmentQuestionsCommand;

public class AssignmentQuestionDto
{
#nullable enable
    public int? Id { get; set; }
#nullable disable
    public string QuestionText { get; set; } = string.Empty;
    public string ExampleAnswer { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
