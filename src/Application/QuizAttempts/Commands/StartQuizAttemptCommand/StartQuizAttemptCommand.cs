using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using System.Text.Json;

namespace Edunary.Application.QuizAttempts.Commands.StartQuizAttemptCommand;

public record StartQuizAttemptCommand : IRequest<ReturnResult<StartAttemptResultDto>>
{
    public int QuizId { get; init; }
}

public class StartQuizAttemptCommandHandler : IRequestHandler<StartQuizAttemptCommand, ReturnResult<StartAttemptResultDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public StartQuizAttemptCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ReturnResult<StartAttemptResultDto>> Handle(StartQuizAttemptCommand request, CancellationToken cancellationToken)
    {
        try
        {
            string userId = _currentUserService.UserId;

            Quiz quiz = await _context.Quizzes
                .FirstOrDefaultAsync(q => q.Id == request.QuizId, cancellationToken);

            if (quiz == null)
                return new ReturnResult<StartAttemptResultDto> { Result = null, Message = "Quiz not found." };

            bool isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.CourseId == quiz.CourseId && e.StudentId == userId, cancellationToken);

            if (!isEnrolled)
                return new ReturnResult<StartAttemptResultDto> { Result = null, Message = "You are not enrolled in this course." };

            if (quiz.MaxAttempts > 0)
            {
                int completedAttempts = await _context.QuizAttempts
                    .CountAsync(a => a.QuizId == request.QuizId && a.UserId == userId && !a.IsActive, cancellationToken);

                if (completedAttempts >= quiz.MaxAttempts)
                    return new ReturnResult<StartAttemptResultDto> { Result = null, Message = "Maximum attempts reached." };
            }

            QuizAttempt existingAttempt = await _context.QuizAttempts
                .FirstOrDefaultAsync(a => a.QuizId == request.QuizId && a.UserId == userId && a.IsActive, cancellationToken);

            bool isResumed = false;

            if (existingAttempt != null)
            {
                if (quiz.TimeLimitMinutes > 0 && existingAttempt.ExpiryTime.HasValue && DateTime.UtcNow > existingAttempt.ExpiryTime.Value)
                {
                    existingAttempt.IsActive = false;
                    existingAttempt.Score = 0;
                    existingAttempt.IsPassed = false;
                    await _context.SaveChangesAsync(cancellationToken);
                    existingAttempt = null;
                }
                else
                {
                    isResumed = true;
                }
            }

            QuizAttemptSnapshot snapshot = await _context.QuizAttemptSnapshots
                .Where(s => s.QuizId == request.QuizId)
                .OrderByDescending(s => s.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (snapshot == null || quiz.IsBeingConvertToSnapshot)
            {
                // Hangfire snapshot job is not yet complete — instructor must save questions first.
                return new ReturnResult<StartAttemptResultDto>
                {
                    Result = null,
                    Message = "This quiz is not ready yet. Please try again in a moment."
                };
            }

            if (existingAttempt == null)
            {
                existingAttempt = new QuizAttempt
                {
                    QuizId = quiz.Id,
                    UserId = userId,
                    QuizAttemptSnapshotId = snapshot.Id,
                    IsActive = true,
                    StartTime = DateTime.UtcNow,
                    ExpiryTime = quiz.TimeLimitMinutes > 0
                        ? DateTime.UtcNow.AddMinutes(quiz.TimeLimitMinutes)
                        : null
                };
                _context.QuizAttempts.Add(existingAttempt);
                await _context.SaveChangesAsync(cancellationToken);
            }

            List<SnapshotQuestionModel> snapshotQuestions = JsonSerializer.Deserialize<List<SnapshotQuestionModel>>(
                snapshot.QuizQuestions,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();

            int attemptNumber = await _context.QuizAttempts
                .CountAsync(a => a.QuizId == request.QuizId && a.UserId == userId, cancellationToken);

            StartAttemptResultDto dto = new StartAttemptResultDto
            {
                AttemptId = existingAttempt.Id,
                QuizId = quiz.Id,
                QuizTitle = quiz.Title,
                QuizDescription = quiz.Description,
                TimeLimitMinutes = quiz.TimeLimitMinutes,
                PassingScore = quiz.PassingScore,
                MaxAttempts = quiz.MaxAttempts,
                AttemptNumber = attemptNumber,
                StartTime = DateTime.SpecifyKind(existingAttempt.StartTime, DateTimeKind.Utc),
                ExpiryTime = existingAttempt.ExpiryTime.HasValue 
                    ? DateTime.SpecifyKind(existingAttempt.ExpiryTime.Value, DateTimeKind.Utc) 
                    : null,
                IsResumed = isResumed,
                Questions = snapshotQuestions.Select(q => new StudentQuestionDto
                {
                    Id = q.Id,
                    Name = q.Name,
                    Type = q.Type,
                    SortOrder = q.SortOrder,
                    Choices = q.Choices.Select(c => new StudentChoiceDto
                    {
                        Id = c.Id,
                        Text = c.Text
                    }).ToList()
                }).ToList()
            };

            return new ReturnResult<StartAttemptResultDto> { Result = dto, Message = isResumed ? "Resumed existing attempt." : "New attempt started." };
        }
        catch (Exception ex)
        {
            return new ReturnResult<StartAttemptResultDto> { Result = null, Message = $"An error occurred: {ex.Message}" };
        }
    }
}

// Internal deserialization models — not public DTOs
internal class SnapshotQuestionModel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public List<SnapshotChoiceModel> Choices { get; set; } = new();
}

internal class SnapshotChoiceModel
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int SortOrder { get; set; }
}
