using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.S3;
using Amazon.S3.Model;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Common;
using Edunary.Infrastructure.Helpers;
using Microsoft.Extensions.Options;

namespace Edunary.Infrastructure.Services;
public class UploadFileService : IUploadFileService
{
    private readonly Cloudinary _cloudinary;
    private readonly IAmazonS3 _s3Client;
    private readonly DigitalOceanSettings _spacesSettings;
    private readonly ICurrentUserService _currentUserService;
    public UploadFileService(
        IOptions<CloudinarySettings> config,
        IOptions<DigitalOceanSettings> spacesOptions,
        IAmazonS3 s3Client,
        ICurrentUserService currentUserService)
    {
        var account = new Account(config.Value.CloudName, config.Value.ApiKey, config.Value.ApiSecret);
        _cloudinary = new Cloudinary(account);
        _s3Client = s3Client;
        _spacesSettings = spacesOptions.Value;
        _currentUserService = currentUserService;
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
        var result = await _cloudinary.DestroyAsync(deletionParams);
        if (result.Result == "ok") return false;
        return true;
    }
    
    public async Task<string> UploadFileToSpacesAsync(Stream fileStream, string fileName, string contentType)
    {
        var userId = _currentUserService?.UserId;
        var folder = $"courses/{userId}";
        var request = new PutObjectRequest
        {
            BucketName = _spacesSettings.SpaceName,
            Key = $"{folder}/{fileName}",
            InputStream = fileStream,
            ContentType = contentType,
            CannedACL = S3CannedACL.PublicRead
        };
        var response = await _s3Client.PutObjectAsync(request);

        if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
        {
            return $"{_spacesSettings.CDNEndpoint}/{folder}/{fileName}";
        }
        return null;
    }

    public async Task<bool> DeleteFileFromSpacesAsync(string fileName)
    {
        var userId = _currentUserService?.UserId;
        var folder = $"courses/{userId}";
        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = _spacesSettings.SpaceName,
            Key = $"{folder}/{fileName}"
        };
        var response = await _s3Client.DeleteObjectAsync(deleteRequest);
        return response.HttpStatusCode == System.Net.HttpStatusCode.NoContent;
    }

    public string GeneratePresignedUrl(string fileName, string contentType)
    {
        var userId = _currentUserService?.UserId;
        var folder = $"courses/{userId}";
        var key = $"{folder}/{fileName}";
        var duration = 5;

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _spacesSettings.SpaceName,
            Key = key,
            Verb = HttpVerb.PUT,
            ContentType = contentType,
            Expires = DateTime.UtcNow.AddMinutes(duration),
        };
        request.Parameters.Add("x-amz-acl", "public-read");
        string url = _s3Client.GetPreSignedURL(request);
        return url;
    }
}
