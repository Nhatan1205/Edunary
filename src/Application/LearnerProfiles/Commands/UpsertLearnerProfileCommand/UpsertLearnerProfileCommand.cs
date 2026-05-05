using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.LearnerProfiles.Commands.UpsertLearnerProfileCommand;
public record UpsertLearnerProfileCommand : IRequest<Result>
{
    public string Goal { get; init; }
    public string SkillLevel { get; init; }
    public List<int> PreferredCategoryIds { get; init; }
    public List<int> PreferredTopicIds { get; init; }
    public int? WeeklyHours { get; init; }
}

public class UpsertLearnerProfileCommandHandler : IRequestHandler<UpsertLearnerProfileCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserEmbeddingJobService _userEmbeddingJobService;

    public UpsertLearnerProfileCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IUserEmbeddingJobService userEmbeddingJobService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _userEmbeddingJobService = userEmbeddingJobService;
    }

    public async Task<Result> Handle(UpsertLearnerProfileCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService?.UserId;
            if (string.IsNullOrEmpty(userId))
                return Result.Failure("Unauthorized.");

            var profile = await _context.LearnerProfiles
                .FirstOrDefaultAsync(p => p.StudentId == userId, cancellationToken);

            if (profile == null)
            {
                profile = new LearnerProfile { StudentId = userId };
                _context.LearnerProfiles.Add(profile);
            }

            if (request.Goal != null)
            {
                profile.Goal = request.Goal;
            }

            if (request.SkillLevel != null)
            {
                profile.SkillLevel = request.SkillLevel;
            }

            if (request.PreferredCategoryIds != null)
            {
                profile.PreferredCategoryIds = JsonSerializer.Serialize(request.PreferredCategoryIds);
            }

            if (request.PreferredTopicIds != null)
            {
                profile.PreferredTopicIds = JsonSerializer.Serialize(request.PreferredTopicIds);
            }

            if (request.WeeklyHours.HasValue)
            {
                profile.WeeklyHours = request.WeeklyHours.Value;
            }

            await _context.SaveChangesAsync(cancellationToken);

            // Trigger async re-embedding so the Qdrant vector stays in sync
            _userEmbeddingJobService.EnqueueUserProfileEmbedding(userId);

            return Result.Success(null, "Learner profile updated successfully.");


        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred: {ex.Message}");
        }
    }
}

