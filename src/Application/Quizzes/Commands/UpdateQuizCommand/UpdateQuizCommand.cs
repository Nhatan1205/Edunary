using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Quizzes.Commands.UpdateQuizCommand;

public record UpdateQuizCommand : IRequest<Result>
{
    public int QuizId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
#nullable enable
    public string? RelatedItemId { get; init; }
#nullable disable
    public int TimeLimitMinutes { get; init; }
    public double PassingScore { get; init; }
    public int MaxAttempts { get; init; }
    public bool ShowCorrectAnswers { get; init; }
    public bool RandomizeQuestions { get; init; }
}

public class UpdateQuizCommandHandler : IRequestHandler<UpdateQuizCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateQuizCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdateQuizCommand request, CancellationToken cancellationToken)
    {
        Quiz quiz = await _context.Quizzes
            .Include(q => q.Course)
            .FirstOrDefaultAsync(q => q.Id == request.QuizId, cancellationToken);

        if (quiz == null)
            return Result.Failure(new[] { "Quiz not found." });

        if (quiz.Course.CreatedBy != _currentUserService.UserId)
            return Result.Failure(new[] { "Access denied." });

        quiz.Title = request.Title;
        quiz.Description = request.Description;
        quiz.RelatedItemId = request.RelatedItemId;
        quiz.TimeLimitMinutes = request.TimeLimitMinutes;
        quiz.PassingScore = request.PassingScore;
        quiz.MaxAttempts = request.MaxAttempts;
        quiz.ShowCorrectAnswers = request.ShowCorrectAnswers;
        quiz.RandomizeQuestions = request.RandomizeQuestions;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
