using Edunary.Application.Common.Models;

namespace Edunary.Application.Common.Interfaces;

public interface IActivityLogService
{
    // Enqueues a log entry via Hangfire background job.
    void EnqueueLog(ActivityLogEntry entry);
}
