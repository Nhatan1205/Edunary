namespace Edunary.Application.Common.Interfaces;

public interface ICaptionGenerationJobService
{
    void EnqueueCaptionGeneration(string userId, int mediaFileId, int? targetLanguage);
    Task ProcessCaptionGenerationAsync(string userId, int mediaFileId, int? targetLanguage);
}
