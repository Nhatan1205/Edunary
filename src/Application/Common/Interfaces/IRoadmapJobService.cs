namespace Edunary.Application.Common.Interfaces;

public interface IRoadmapJobService
{
    void EnqueueRoadmapGeneration(string userId, string description, int roadmapTopicId);
    Task ProcessRoadmapGenerationAsync(string userId, string description, int roadmapTopicId);
}
