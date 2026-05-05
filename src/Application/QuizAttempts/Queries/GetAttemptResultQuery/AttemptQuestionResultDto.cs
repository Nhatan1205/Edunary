namespace Edunary.Application.QuizAttempts.Queries.GetAttemptResultQuery;

public class AttemptQuestionResultDto
{
    public int QuestionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public List<AttemptChoiceResultDto> Choices { get; set; } = new();
}
