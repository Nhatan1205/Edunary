using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Entities;

namespace Edunary.Application.Quizzes.Queries.GetQuizByItemIdQuery;

public record GetQuizByItemIdQuery : IRequest<QuizDto>
{
    public int CourseId { get; init; }
    public string ItemId { get; init; } = string.Empty;
}

public class GetQuizByItemIdQueryHandler : IRequestHandler<GetQuizByItemIdQuery, QuizDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetQuizByItemIdQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<QuizDto> Handle(GetQuizByItemIdQuery request, CancellationToken cancellationToken)
    {
        string userId = _currentUserService.UserId;

        // Accept: course instructor OR enrolled student
        bool isEnrolled = await _context.Enrollments
            .AnyAsync(e => e.CourseId == request.CourseId && e.StudentId == userId, cancellationToken);

        Quiz quiz = await _context.Quizzes
            .Include(q => q.Questions.OrderBy(qn => qn.SortOrder))
                .ThenInclude(q => q.Choices.OrderBy(c => c.SortOrder))
            .Include(q => q.Course)
            .FirstOrDefaultAsync(
                q => q.CourseId == request.CourseId
                    && q.ItemId == request.ItemId
                    && (q.Course.CreatedBy == userId || isEnrolled),
                cancellationToken);

        if (quiz == null)
            return null;

        return new QuizDto
        {
            Id = quiz.Id,
            Title = quiz.Title,
            Description = quiz.Description,
            CourseId = quiz.CourseId,
            ItemId = quiz.ItemId,
            RelatedItemId = quiz.RelatedItemId,
            IsBeingConvertToSnapshot = quiz.IsBeingConvertToSnapshot,
            TimeLimitMinutes = quiz.TimeLimitMinutes,
            PassingScore = quiz.PassingScore,
            MaxAttempts = quiz.MaxAttempts,
            ShowCorrectAnswers = quiz.ShowCorrectAnswers,
            RandomizeQuestions = quiz.RandomizeQuestions,
            Questions = quiz.Questions.Select(q => new QuizQuestionDto
            {
                Id = q.Id,
                Name = q.Name,
                Type = q.Type.ToString(),
                Explanation = q.Explanation,
                SortOrder = q.SortOrder,
                Choices = q.Choices.Select(c => new QuizChoiceDto
                {
                    Id = c.Id,
                    Text = c.Text,
                    IsCorrect = c.IsCorrect,
                    SortOrder = c.SortOrder
                }).ToList()
            }).ToList()
        };
    }
}
