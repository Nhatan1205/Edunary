using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.LearnerProfiles.Commands.UpsertLearnerProfileCommand;

public record UpsertLearnerProfileCommand : IRequest<Result>
{
    public string Goal { get; init; } = string.Empty;
    public string SkillLevel { get; init; } = string.Empty;
    public List<string> KnownSkills { get; init; } = new();
    public List<string> Interests { get; init; } = new();
    public int WeeklyHours { get; init; }
    public int TimelineMonths { get; init; }
}

public class UpsertLearnerProfileCommandHandler : IRequestHandler<UpsertLearnerProfileCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpsertLearnerProfileCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
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

            profile.Goal = request.Goal;
            profile.SkillLevel = request.SkillLevel;
            profile.KnownSkills = JsonSerializer.Serialize(request.KnownSkills);
            profile.Interests = JsonSerializer.Serialize(request.Interests);
            profile.WeeklyHours = request.WeeklyHours;
            profile.TimelineMonths = request.TimelineMonths;

            var result = await _context.SaveChangesAsync(cancellationToken);

            return result > 0
                ? Result.Success(null, "Learner profile updated successfully.")
                : Result.Failure("Failed to update learner profile.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred: {ex.Message}");
        }
    }
}
