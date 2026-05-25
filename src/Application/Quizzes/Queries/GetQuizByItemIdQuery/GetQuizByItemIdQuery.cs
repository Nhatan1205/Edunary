using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Domain.Constants;

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
    private readonly ICourseAuthorizationService _courseAuth;
    private readonly IIdentityService _identityService;

    public GetQuizByItemIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
        _identityService = identityService;
    }

    public async Task<QuizDto> Handle(GetQuizByItemIdQuery request, CancellationToken cancellationToken)
    {
        string userId = _currentUserService.UserId;

        // Accept: course instructor/collaborator OR enrolled student OR administrator
        bool isEnrolled = await _context.Enrollments
            .AnyAsync(e => e.CourseId == request.CourseId && e.StudentId == userId, cancellationToken);

        bool hasInstructorAccess = await _courseAuth.HasCourseAccessAsync(request.CourseId, userId, cancellationToken: cancellationToken);

        bool isAdmin = await _identityService.IsInRoleAsync(userId, Roles.Administrator)
            || await _identityService.IsInRoleAsync(userId, Roles.SuperAdmin);

        if (!isEnrolled && !hasInstructorAccess && !isAdmin)
            return null;

        Quiz quiz = await _context.Quizzes
            .Include(q => q.Questions.OrderBy(qn => qn.SortOrder))
                .ThenInclude(q => q.Choices.OrderBy(c => c.SortOrder))
            .FirstOrDefaultAsync(
                q => q.CourseId == request.CourseId && q.ItemId == request.ItemId,
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
