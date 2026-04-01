using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Application.Common.Interfaces;

public interface IVideoProcessorService
{
    Task<int> ConvertToAdaptiveHlsAsync(string inputFilePath, string outputBaseDir, string thumbnailFilePath);
    Task<double> GetVideoDurationInSecondsAsync(string videoPath);
    Task GenerateThumbnailAtHalfwayAsync(string videoPath, string outputImagePath);
}
