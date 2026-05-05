using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Quizzes.Commands.UpdateQuizQuestionsCommand;

public record UpdateQuizQuestionsCommand : IRequest<Result>
{
    public int QuizId { get; init; }
    public List<QuestionDto> Questions { get; init; } = new();
}

public class UpdateQuizQuestionsCommandHandler : IRequestHandler<UpdateQuizQuestionsCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IQuizSnapshotJobService _snapshotJobService;

    public UpdateQuizQuestionsCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IQuizSnapshotJobService snapshotJobService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _snapshotJobService = snapshotJobService;
    }

    public async Task<Result> Handle(UpdateQuizQuestionsCommand request, CancellationToken cancellationToken)
    {
        Quiz quiz = await _context.Quizzes
            .Include(q => q.Course)
            .Include(q => q.Questions)
                .ThenInclude(q => q.Choices)
            .FirstOrDefaultAsync(q => q.Id == request.QuizId, cancellationToken);

        if (quiz == null)
            return Result.Failure(new[] { "Quiz not found." });

        if (quiz.Course.CreatedBy != _currentUserService.UserId)
            return Result.Failure(new[] { "Access denied." });

        HashSet<int> incomingQuestionIds = request.Questions
            .Where(q => q.Id.HasValue)
            .Select(q => q.Id!.Value)
            .ToHashSet();

        List<Question> toDelete = quiz.Questions
            .Where(q => !incomingQuestionIds.Contains(q.Id))
            .ToList();
        _context.Questions.RemoveRange(toDelete);

        foreach (QuestionDto qDto in request.Questions)
        {
            if (qDto.Id.HasValue)
            {
                Question existing = quiz.Questions.First(q => q.Id == qDto.Id.Value);
                existing.Name = qDto.Name;
                existing.Type = qDto.Type;
                existing.Explanation = qDto.Explanation;
                existing.SortOrder = qDto.SortOrder;
                SyncChoices(existing, qDto.Choices);
            }
            else
            {
                Question newQ = new Question
                {
                    QuizId = quiz.Id,
                    Name = qDto.Name,
                    Type = qDto.Type,
                    Explanation = qDto.Explanation,
                    SortOrder = qDto.SortOrder,
                    Choices = qDto.Choices.Select(c => new Choice
                    {
                        Text = c.Text,
                        IsCorrect = c.IsCorrect,
                        SortOrder = c.SortOrder
                    }).ToList()
                };
                _context.Questions.Add(newQ);
            }
        }

        quiz.IsBeingConvertToSnapshot = true;
        await _context.SaveChangesAsync(cancellationToken);

        // Enqueue Hangfire background job via interface (keeps Application layer free of Hangfire dependency)
        _snapshotJobService.EnqueueSnapshotCreation(quiz.Id);

        return Result.Success();
    }

    private void SyncChoices(Question question, List<ChoiceDto> incomingChoices)
    {
        HashSet<int> incomingIds = incomingChoices
            .Where(c => c.Id.HasValue)
            .Select(c => c.Id!.Value)
            .ToHashSet();

        List<Choice> toDelete = question.Choices
            .Where(c => !incomingIds.Contains(c.Id))
            .ToList();
        _context.Choices.RemoveRange(toDelete);

        foreach (ChoiceDto cDto in incomingChoices)
        {
            if (cDto.Id.HasValue)
            {
                Choice existing = question.Choices.First(c => c.Id == cDto.Id.Value);
                existing.Text = cDto.Text;
                existing.IsCorrect = cDto.IsCorrect;
                existing.SortOrder = cDto.SortOrder;
            }
            else
            {
                question.Choices.Add(new Choice
                {
                    Text = cDto.Text,
                    IsCorrect = cDto.IsCorrect,
                    SortOrder = cDto.SortOrder
                });
            }
        }
    }
}
