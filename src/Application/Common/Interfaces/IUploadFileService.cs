using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Application.Common.Interfaces;
public interface IUploadFileService
{
    Task<string> UploadImageToCloudinary(string img, string imgId);
    Task<bool> DeleteImageInCloudinary(string imgId);
    Task<string> UploadFileToSpacesAsync(Stream fileStream, string fileName, string contentType);
    Task<bool> DeleteFileFromSpacesAsync(string fileName);
    Task<string> GeneratePresignedUrl(string fileName, string contentType);
}