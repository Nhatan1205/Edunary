using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;

using Edunary.Application.Common.Models;

using Edunary.Application.Common.Behaviours;

namespace Edunary.Application.Quizzes.Commands.GenerateQuizQuestionsCommand;

[ActivityLog(ActivityType.GenerateQuizQuestions, "Generate Quiz Questions")]
public record GenerateQuizQuestionsCommand : IRequest<Result>
{
    public int CourseId { get; init; }
    public string ItemId { get; init; } = string.Empty;
    public string RelatedItemId { get; init; } = string.Empty;
    public int NumQuestions { get; init; } = 5;
    public List<string> QuestionTypes { get; init; } = new() { "SingleChoice", "MultipleChoice", "TrueFalse" };
    public string Difficulty { get; init; } = "Medium";
    public string PromptDescription { get; init; } = string.Empty;
}

public class GenerateQuizQuestionsCommandHandler : IRequestHandler<GenerateQuizQuestionsCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IQuizGenerationJobService _jobService;
    private readonly ICourseAuthorizationService _courseAuth;

    public GenerateQuizQuestionsCommandHandler(
        ICurrentUserService currentUserService,
        IQuizGenerationJobService jobService,
        ICourseAuthorizationService courseAuth)
    {
        _currentUserService = currentUserService;
        _jobService = jobService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(GenerateQuizQuestionsCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        if (string.IsNullOrEmpty(userId))
            return Result.Failure("User is not authenticated.");

        bool canManage = await _courseAuth.HasCourseAccessAsync(request.CourseId, userId, CoursePermission.Manage, cancellationToken);
        if (!canManage)
            return Result.Failure("You do not have Manage permissions for this course.");

        _jobService.EnqueueQuizGeneration(
            userId,
            request.CourseId,
            request.ItemId,
            request.RelatedItemId,
            request.NumQuestions,
            request.QuestionTypes,
            request.Difficulty,
            request.PromptDescription);

        return Result.Success();
    }
}
