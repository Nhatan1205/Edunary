using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Entities;
using Edunary.Infrastructure.Data;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Edunary.Infrastructure.Services;

public class QuizSnapshotJobService : IQuizSnapshotJobService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<QuizSnapshotJobService> _logger;

    public QuizSnapshotJobService(
        ApplicationDbContext context,
        ILogger<QuizSnapshotJobService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public void EnqueueSnapshotCreation(int quizId)
    {
        BackgroundJob.Enqueue<IQuizSnapshotJobService>(
            svc => svc.CreateSnapshotAsync(quizId, CancellationToken.None));
    }

    public async Task CreateSnapshotAsync(int quizId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Creating quiz snapshot for QuizId={QuizId}", quizId);

            Quiz quiz = await _context.Quizzes
                .Include(q => q.Questions.OrderBy(qn => qn.SortOrder))
                    .ThenInclude(q => q.Choices.OrderBy(c => c.SortOrder))
                .FirstOrDefaultAsync(q => q.Id == quizId, cancellationToken);

            if (quiz == null)
            {
                _logger.LogWarning("Quiz not found for snapshot. QuizId={QuizId}", quizId);
                return;
            }

            // Serialize questions + choices into snapshot JSON
            List<SnapshotQuestion> snapshotData = quiz.Questions.Select(q => new SnapshotQuestion
            {
                Id = q.Id,
                Name = q.Name,
                Type = q.Type.ToString(),
                Explanation = q.Explanation,
                SortOrder = q.SortOrder,
                Choices = q.Choices.Select(c => new SnapshotChoice
                {
                    Id = c.Id,
                    Text = c.Text,
                    IsCorrect = c.IsCorrect,
                    SortOrder = c.SortOrder
                }).ToList()
            }).ToList();

            string jsonSnapshot = JsonSerializer.Serialize(snapshotData);

            QuizAttemptSnapshot snapshot = new QuizAttemptSnapshot
            {
                QuizId = quizId,
                QuizQuestions = jsonSnapshot
            };
            _context.QuizAttemptSnapshots.Add(snapshot);

            // Clear the lock flag
            quiz.IsBeingConvertToSnapshot = false;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Quiz snapshot created. QuizId={QuizId}, SnapshotId={SnapshotId}", quizId, snapshot.Id);

            // Notify the quiz creator via SignalR
            // await _notifyService.SendToUser(
            //     quiz.CreatedBy,
            //     "QuizSnapshotReady",
            //     new { quizId, snapshotId = snapshot.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create quiz snapshot. QuizId={QuizId}", quizId);

            // Reset the lock flag so instructor can retry
            Quiz quiz = await _context.Quizzes.FindAsync(new object[] { quizId }, cancellationToken);
            if (quiz != null)
            {
                quiz.IsBeingConvertToSnapshot = false;
                await _context.SaveChangesAsync(cancellationToken);
            }
            throw;
        }
    }
}

// Internal DTOs for snapshot JSON serialization only — not domain entities
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
