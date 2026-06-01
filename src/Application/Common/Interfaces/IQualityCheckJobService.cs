namespace Edunary.Application.Common.Interfaces;

public interface IQualityCheckJobService
{
    void EnqueueQualityCheck(string userId, int courseId, int reportId);
    Task ProcessQualityCheckAsync(string userId, int courseId, int reportId);
    void EnqueueQualityCheckDiff(string userId, int courseId, int reportId);
    Task ProcessQualityCheckDiffAsync(string userId, int courseId, int reportId);
}
