namespace Edunary.Application.QuizAttempts.Commands.StartQuizAttemptCommand;

public class StudentQuestionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public List<StudentChoiceDto> Choices { get; set; } = new();
}
