namespace Edunary.Application.QuizAttempts.Queries.GetAttemptResultQuery;

public class AttemptChoiceResultDto
{
    public int ChoiceId { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public bool WasSelected { get; set; }
}
