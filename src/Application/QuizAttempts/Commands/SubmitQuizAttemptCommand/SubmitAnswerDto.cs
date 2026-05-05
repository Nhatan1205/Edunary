namespace Edunary.Application.QuizAttempts.Commands.SubmitQuizAttemptCommand;

public record SubmitAnswerDto
{
    public int QuestionId { get; init; }
    public List<int> SelectedChoiceIds { get; init; } = new();
}
