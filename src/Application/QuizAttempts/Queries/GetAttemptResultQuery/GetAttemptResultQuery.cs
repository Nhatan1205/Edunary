using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Entities;
using System.Text.Json;

namespace Edunary.Application.QuizAttempts.Queries.GetAttemptResultQuery;

public record GetAttemptResultQuery : IRequest<AttemptResultDto>
{
    public int AttemptId { get; init; }
}

public class GetAttemptResultQueryHandler : IRequestHandler<GetAttemptResultQuery, AttemptResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetAttemptResultQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<AttemptResultDto> Handle(GetAttemptResultQuery request, CancellationToken cancellationToken)
    {
        QuizAttempt attempt = await _context.QuizAttempts
            .Include(a => a.Quiz)
            .Include(a => a.Answers)
                .ThenInclude(ans => ans.AnswerChoices)
            .Include(a => a.Snapshot)
            .FirstOrDefaultAsync(
                a => a.Id == request.AttemptId && a.UserId == _currentUserService.UserId,
                cancellationToken);

        if (attempt == null || attempt.IsActive)
            return null;

        List<SnapshotQuestion> snapshotQuestions = JsonSerializer.Deserialize<List<SnapshotQuestion>>(
            attempt.Snapshot.QuizQuestions,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();

        bool showAnswers = attempt.Quiz.ShowCorrectAnswers;
        int correctCount = attempt.Answers.Count(a => a.IsCorrect);

        List<AttemptQuestionResultDto> questionResults = snapshotQuestions.Select(sq =>
        {
            QuizAttemptAnswer answerRecord = attempt.Answers.FirstOrDefault(a => a.SnapshotQuestionId == sq.Id);
            HashSet<int> selectedChoiceIds = answerRecord?.AnswerChoices.Select(ac => ac.ChoiceId).ToHashSet() ?? new();

            return new AttemptQuestionResultDto
            {
                QuestionId = sq.Id,
                Name = sq.Name,
                Type = sq.Type,
                Explanation = showAnswers ? sq.Explanation : string.Empty,
                IsCorrect = answerRecord?.IsCorrect ?? false,
                Choices = sq.Choices.Select(c => new AttemptChoiceResultDto
                {
                    ChoiceId = c.Id,
                    Text = c.Text,
                    IsCorrect = showAnswers ? c.IsCorrect : false,
                    WasSelected = selectedChoiceIds.Contains(c.Id)
                }).ToList()
            };
        }).ToList();

        return new AttemptResultDto
        {
            AttemptId = attempt.Id,
            QuizId = attempt.QuizId,
            QuizTitle = attempt.Quiz.Title,
            Score = attempt.Score,
            IsPassed = attempt.IsPassed,
            CorrectCount = correctCount,
            TotalQuestions = snapshotQuestions.Count,
            PassingScore = attempt.Quiz.PassingScore,
            ShowCorrectAnswers = showAnswers,
            Questions = questionResults
        };
    }
}

internal class SnapshotQuestion
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public List<SnapshotChoice> Choices { get; set; } = new();
}

internal class SnapshotChoice
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int SortOrder { get; set; }
}
