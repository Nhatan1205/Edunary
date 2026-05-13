namespace Edunary.Application.Common.Interfaces;

public interface ICaptionGenerationJobService
{
    /// <summary>
    /// Enqueue a Hangfire job to generate an AI caption for the given video.
    /// </summary>
    /// <param name="userId">The requesting instructor's user ID (for SignalR progress).</param>
    /// <param name="mediaFileId">The MediaFile to generate captions for.</param>
    /// <param name="targetLanguage">
    /// The desired caption language as <see cref="Domain.Enums.Languages"/> integer value.
    /// Null means "transcribe only — auto-detect language, store source transcript".
    /// </param>
    void EnqueueCaptionGeneration(string userId, int mediaFileId, int? targetLanguage);

    /// <summary>
    /// Background job body — do not call directly; invoked by Hangfire.
    /// </summary>
    Task ProcessCaptionGenerationAsync(string userId, int mediaFileId, int? targetLanguage);
}
