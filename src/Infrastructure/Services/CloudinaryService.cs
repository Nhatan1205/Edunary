using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Infrastructure.Helpers;
using Microsoft.Extensions.Options;
using Stripe.Tax;

namespace Edunary.Infrastructure.Services;
public class CloudinaryService : IImageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IOptions<CloudinarySettings> config)
    {
        var account = new Account(config.Value.CloudName, config.Value.ApiKey, config.Value.ApiSecret);
        _cloudinary = new Cloudinary(account);
    }
    public async Task<ImageUploadResponse> AddImageAsync(Stream fileStream,string filename)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(filename, fileStream),
            Folder = "uploads",
        };
        var result = await _cloudinary.UploadAsync(uploadParams);
        return new ImageUploadResponse
        {
            Url = result.SecureUrl.ToString(),
            PublicId = result.PublicId
        };
    }

    public async Task<bool> DeletePhotoAsync(string publicId)
    {
        var deletionParams = new DeletionParams(publicId);
        var  result = await _cloudinary.DestroyAsync(deletionParams);
        if(result == null) return false;
        return true;
    }
}
