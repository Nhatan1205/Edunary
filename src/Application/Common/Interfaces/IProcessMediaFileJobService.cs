using System.Threading.Tasks;

namespace Edunary.Application.Common.Interfaces;

public interface IProcessMediaFileJobService
{
    void EnqueueVideoProcessing(int mediaFileId);
    Task ProcessVideoToHlsAsync(int mediaFileId);
}
