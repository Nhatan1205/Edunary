namespace Edunary.Application.QuizAttempts.Commands.StartQuizAttemptCommand;

public class StudentChoiceDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    // IsCorrect intentionally omitted — never expose to student during attempt
}
