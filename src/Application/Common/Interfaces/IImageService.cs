using Edunary.Application.Common.Models;

namespace Edunary.Application.Common.Interfaces;
public interface IImageService
{
    Task<ImageUploadResponse> AddImageAsync(Stream fileStream, string filename);

    Task<bool> DeletePhotoAsync(string publicId);
}
