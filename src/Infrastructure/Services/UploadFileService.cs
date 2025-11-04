using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using Edunary.Infrastructure.Helpers;

namespace Edunary.Infrastructure.Services;
public class UploadFileService : IUploadFileService
{
    private readonly Cloudinary _cloudinary;
    public UploadFileService(IOptions<CloudinarySettings> config)
    {
        var account = new Account(config.Value.CloudName, config.Value.ApiKey, config.Value.ApiSecret);
        _cloudinary = new Cloudinary(account);
    }
    public async Task<string> UploadImageToCloudinary(string img, string imgId)
    {
        var temp = img.Split(',');
        var imgFile = temp[1];
        byte[] imageBytes = Convert.FromBase64String(imgFile);

        using (var stream = new MemoryStream(imageBytes))
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription($"{imgId}.jpg", stream),
                Folder = $"uploads/courses",
                PublicId = imgId.ToString(),
                Overwrite = true,
                Invalidate = true
            };
            var result = await _cloudinary.UploadAsync(uploadParams);
            if (result.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return result.SecureUrl.AbsoluteUri;
            }
            else return null;
        }
    }
    public async Task<bool> DeleteImageInCloudinary(string imgId)
    {
        var deletionParams = new DeletionParams($"uploads/courses/{imgId}");
        var  result = await _cloudinary.DestroyAsync(deletionParams);
        if(result.Result == "ok") return false;
        return true;
    }
}
