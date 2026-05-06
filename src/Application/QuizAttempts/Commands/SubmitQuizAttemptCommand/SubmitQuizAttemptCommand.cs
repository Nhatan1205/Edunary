using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.CourseProgresses.Commands.UpdateCompleteCPCommand;
using Edunary.Domain.Entities;
using System.Text.Json;

namespace Edunary.Application.QuizAttempts.Commands.SubmitQuizAttemptCommand;

public record SubmitQuizAttemptCommand : IRequest<ReturnResult<SubmitResultDto>>
{
    public int AttemptId { get; init; }
    public List<SubmitAnswerDto> Answers { get; init; } = new();
}

public class SubmitQuizAttemptCommandHandler : IRequestHandler<SubmitQuizAttemptCommand, ReturnResult<SubmitResultDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IQuizCacheService _cacheService;
    private readonly ISender _sender;

    public SubmitQuizAttemptCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IQuizCacheService cacheService,
        ISender sender)
    {
        _context = context;
        _currentUserService = currentUserService;
        _cacheService = cacheService;
        _sender = sender;
    }

    public async Task<ReturnResult<SubmitResultDto>> Handle(SubmitQuizAttemptCommand request, CancellationToken cancellationToken)
    {
        try
        {
            string userId = _currentUserService.UserId;

            QuizAttempt attempt = await _context.QuizAttempts
                .Include(a => a.Quiz)
                .FirstOrDefaultAsync(a => a.Id == request.AttemptId && a.UserId == userId && a.IsActive, cancellationToken);

            if (attempt == null)
                return new ReturnResult<SubmitResultDto> { Result = null, Message = "Invalid or already submitted attempt." };

            QuizAttemptSnapshot snapshot = await _context.QuizAttemptSnapshots
                .FirstOrDefaultAsync(s => s.Id == attempt.QuizAttemptSnapshotId, cancellationToken);

            if (snapshot == null)
                return new ReturnResult<SubmitResultDto> { Result = null, Message = "Quiz snapshot not found." };

            List<SnapshotQuestion> snapshotQuestions = JsonSerializer.Deserialize<List<SnapshotQuestion>>(
                snapshot.QuizQuestions,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();

            // Grading — StudyNest set-equality
            List<QuizAttemptAnswer> attemptAnswers = new();
            List<QuizAttemptAnswerChoice> allChoices = new();
            int correctCount = 0;

            foreach (SnapshotQuestion snapshotQ in snapshotQuestions)
            {
                SubmitAnswerDto submitted = request.Answers.FirstOrDefault(a => a.QuestionId == snapshotQ.Id);
                List<int> selectedIds = submitted?.SelectedChoiceIds ?? new List<int>();

                HashSet<int> correctIds = snapshotQ.Choices
                    .Where(c => c.IsCorrect)
                    .Select(c => c.Id)
                    .ToHashSet();

                bool isCorrect = correctIds.SetEquals(selectedIds.ToHashSet());
                if (isCorrect) correctCount++;

                QuizAttemptAnswer answer = new QuizAttemptAnswer
                {
                    QuizAttemptId = attempt.Id,
                    SnapshotQuestionId = snapshotQ.Id,
                    IsCorrect = isCorrect
                };
                attemptAnswers.Add(answer);

                foreach (int choiceId in selectedIds)
                {
                    allChoices.Add(new QuizAttemptAnswerChoice
                    {
                        QuizAttemptAnswer = answer,
                        ChoiceId = choiceId
                    });
                }
            }

            await _context.QuizAttemptAnswers.AddRangeAsync(attemptAnswers, cancellationToken);
            await _context.QuizAttemptAnswerChoices.AddRangeAsync(allChoices, cancellationToken);

            int totalQuestions = snapshotQuestions.Count;
            int score = totalQuestions > 0 ? (int)Math.Round((double)correctCount / totalQuestions * 100) : 0;
            bool isPassed = attempt.Quiz.PassingScore <= 0 || score >= attempt.Quiz.PassingScore;

            attempt.Score = score;
            attempt.IsPassed = isPassed;
            attempt.IsActive = false;

            await _context.SaveChangesAsync(cancellationToken);

            await _cacheService.ClearCacheAsync(userId, attempt.Id, attempt.QuizId, cancellationToken);

            if (isPassed)
            {
                await _sender.Send(new UpdateCompleteCPCommand
                {
                    CourseId = attempt.Quiz.CourseId,
                    ItemId = attempt.Quiz.ItemId,
                    IsCompleted = true
                }, cancellationToken);
            }

            return new ReturnResult<SubmitResultDto>
            {
                Result = new SubmitResultDto
                {
                    AttemptId = attempt.Id,
                    Score = score,
                    IsPassed = isPassed,
                    CorrectCount = correctCount,
                    TotalQuestions = totalQuestions,
                    PassingScore = attempt.Quiz.PassingScore
                },
                Message = isPassed ? "Passed!" : "Not passed."
            };
        }
        catch (Exception ex)
        {
            return new ReturnResult<SubmitResultDto> { Result = null, Message = $"An error occurred: {ex.Message}" };
        }
    }
}

// Internal deserialization models
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
