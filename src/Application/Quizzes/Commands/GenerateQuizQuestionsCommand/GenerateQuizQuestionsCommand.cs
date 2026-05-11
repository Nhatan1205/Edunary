using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Quizzes.Commands.GenerateQuizQuestionsCommand;

public record GenerateQuizQuestionsCommand : IRequest<bool>
{
    public int CourseId { get; init; }
    public string ItemId { get; init; } = string.Empty;
    public string RelatedItemId { get; init; } = string.Empty;
    public int NumQuestions { get; init; } = 5;
    public List<string> QuestionTypes { get; init; } = new() { "SingleChoice", "MultipleChoice", "TrueFalse" };
    public string Difficulty { get; init; } = "Medium";
    public string PromptDescription { get; init; } = string.Empty;
}

public class GenerateQuizQuestionsCommandHandler : IRequestHandler<GenerateQuizQuestionsCommand, bool>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IQuizGenerationJobService _jobService;

    public GenerateQuizQuestionsCommandHandler(
        ICurrentUserService currentUserService,
        IQuizGenerationJobService jobService)
    {
        _currentUserService = currentUserService;
        _jobService = jobService;
    }

    public Task<bool> Handle(GenerateQuizQuestionsCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        if (string.IsNullOrEmpty(userId))
            return Task.FromResult(false);

        _jobService.EnqueueQuizGeneration(
            userId,
            request.CourseId,
            request.ItemId,
            request.RelatedItemId,
            request.NumQuestions,
            request.QuestionTypes,
            request.Difficulty,
            request.PromptDescription);

        return Task.FromResult(true);
    }
}
