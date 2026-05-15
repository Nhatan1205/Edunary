namespace Edunary.Application.Common.Interfaces;

public interface ICourseProgressFlushService
{
    Task FlushCachedProgressAsync(CancellationToken ct = default);
}
