using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Roadmaps.Commands.GenerateAIRoadmapCommand;

public record GenerateAIRoadmapCommand : IRequest<bool>
{
    public string Description { get; init; } = string.Empty;
    public int RoadmapTopicId { get; init; }
}

public class GenerateAIRoadmapCommandHandler : IRequestHandler<GenerateAIRoadmapCommand, bool>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IRoadmapJobService _jobService;

    public GenerateAIRoadmapCommandHandler(
        ICurrentUserService currentUserService,
        IRoadmapJobService jobService)
    {
        _currentUserService = currentUserService;
        _jobService = jobService;
    }

    public Task<bool> Handle(GenerateAIRoadmapCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        if (string.IsNullOrEmpty(userId))
            return Task.FromResult(false);

        _jobService.EnqueueRoadmapGeneration(userId, request.Description, request.RoadmapTopicId);
        return Task.FromResult(true);
    }
}
