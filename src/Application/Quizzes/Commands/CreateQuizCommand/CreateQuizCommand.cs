using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Quizzes.Commands.CreateQuizCommand;

public record CreateQuizCommand : IRequest<ReturnResult<int>>
{
    public int CourseId { get; init; }
    public string ItemId { get; init; } = string.Empty;
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

public class CreateQuizCommandHandler : IRequestHandler<CreateQuizCommand, ReturnResult<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateQuizCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ReturnResult<int>> Handle(CreateQuizCommand request, CancellationToken cancellationToken)
    {
        try
        {
            Course course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == request.CourseId && c.CreatedBy == _currentUserService.UserId, cancellationToken);

            if (course == null)
                return new ReturnResult<int> { Result = 0, Message = "Course not found or access denied." };

            bool exists = await _context.Quizzes
                .AnyAsync(q => q.CourseId == request.CourseId && q.ItemId == request.ItemId, cancellationToken);

            if (exists)
                return new ReturnResult<int> { Result = 0, Message = "A quiz already exists for this item." };

            Quiz quiz = new Quiz
            {
                CourseId = request.CourseId,
                ItemId = request.ItemId,
                Title = request.Title,
                Description = request.Description,
                RelatedItemId = request.RelatedItemId,
                TimeLimitMinutes = request.TimeLimitMinutes,
                PassingScore = request.PassingScore,
                MaxAttempts = request.MaxAttempts,
                ShowCorrectAnswers = request.ShowCorrectAnswers,
                RandomizeQuestions = request.RandomizeQuestions,
                IsBeingConvertToSnapshot = false
            };

            _context.Quizzes.Add(quiz);
            await _context.SaveChangesAsync(cancellationToken);

            return new ReturnResult<int> { Result = quiz.Id, Message = "Quiz created successfully." };
        }
        catch (Exception ex)
        {
            return new ReturnResult<int> { Result = 0, Message = $"An error occurred: {ex.Message}" };
        }
    }
}
