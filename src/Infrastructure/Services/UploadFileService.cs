using Amazon.S3;
using Amazon.S3.Model;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.SystemSettings.Queries.GetSystemSettingValuesQuery;
using Edunary.Domain.Common;
using Edunary.Domain.Constants;
using Edunary.Infrastructure.Helpers;
using MediatR;
using Microsoft.Extensions.Options;

namespace Edunary.Infrastructure.Services;
public class UploadFileService : IUploadFileService
{
    private readonly IMediator _mediator;
    private readonly CloudinarySettings _fallbackCloudinarySettings;
    private readonly DigitalOceanSettings _fallbackDigitalOceanSettings;
    private readonly ICurrentUserService _currentUserService;

    public UploadFileService(
        IOptions<CloudinarySettings> cloudinaryOptions,
        IOptions<DigitalOceanSettings> spacesOptions,
        IMediator mediator,
        ICurrentUserService currentUserService)
    {
        _fallbackCloudinarySettings = cloudinaryOptions.Value;
        _fallbackDigitalOceanSettings = spacesOptions.Value;
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    private async Task<Cloudinary> GetCloudinaryClientAsync()
    {
        var dbValues = await _mediator.Send(new GetSystemSettingValuesQuery
        {
            Keys = new()
            {
                SettingKey.Cloudinary_CloudName,
                SettingKey.Cloudinary_ApiKey,
                SettingKey.Cloudinary_ApiSecret
            }
        });

        var cloudName = GetOrFallback(dbValues, SettingKey.Cloudinary_CloudName, _fallbackCloudinarySettings.CloudName);
        var apiKey = GetOrFallback(dbValues, SettingKey.Cloudinary_ApiKey, _fallbackCloudinarySettings.ApiKey);
        var apiSecret = GetOrFallback(dbValues, SettingKey.Cloudinary_ApiSecret, _fallbackCloudinarySettings.ApiSecret);

        return new Cloudinary(new Account(cloudName, apiKey, apiSecret));
    }

    private async Task<(IAmazonS3 client, DigitalOceanSettings settings)> GetS3ClientAsync()
    {
        var dbValues = await _mediator.Send(new GetSystemSettingValuesQuery
        {
            Keys = new()
            {
                SettingKey.DigitalOcean_AccessKey,
                SettingKey.DigitalOcean_SecretKey,
                SettingKey.DigitalOcean_Endpoint,
                SettingKey.DigitalOcean_SpaceName,
                SettingKey.DigitalOcean_CDNEndpoint,
                SettingKey.DigitalOcean_SpacesRegion,
            }
        });

        var settings = new DigitalOceanSettings
        {
            AccessKey = GetOrFallback(dbValues, SettingKey.DigitalOcean_AccessKey, _fallbackDigitalOceanSettings.AccessKey),
            SecretKey = GetOrFallback(dbValues, SettingKey.DigitalOcean_SecretKey, _fallbackDigitalOceanSettings.SecretKey),
            Endpoint = GetOrFallback(dbValues, SettingKey.DigitalOcean_Endpoint, _fallbackDigitalOceanSettings.Endpoint),
            SpaceName = GetOrFallback(dbValues, SettingKey.DigitalOcean_SpaceName, _fallbackDigitalOceanSettings.SpaceName),
            CDNEndpoint = GetOrFallback(dbValues, SettingKey.DigitalOcean_CDNEndpoint, _fallbackDigitalOceanSettings.CDNEndpoint),
            SpacesRegion = GetOrFallback(dbValues, SettingKey.DigitalOcean_SpacesRegion, _fallbackDigitalOceanSettings.SpacesRegion)
        };

        var client = new AmazonS3Client(settings.AccessKey, settings.SecretKey,
            new AmazonS3Config
            {
                ServiceURL = settings.Endpoint,
                ForcePathStyle = true,
                AuthenticationRegion = settings.SpacesRegion
            });

        return (client, settings);
    }

    private static string GetOrFallback(Dictionary<string, string> dbValues, string key, string fallback)
    {
        var val = dbValues.GetValueOrDefault(key, string.Empty);
        return !string.IsNullOrEmpty(val) ? val : fallback;
    }

    public async Task<string> UploadImageToCloudinary(string img, string imgId)
    {
        var temp = img.Split(',');
        var imgFile = temp[1];
        byte[] imageBytes = Convert.FromBase64String(imgFile);

        var cloudinary = await GetCloudinaryClientAsync();

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
            var result = await cloudinary.UploadAsync(uploadParams);
            if (result.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return result.SecureUrl.AbsoluteUri;
            }
            else return null;
        }
    }

    public async Task<bool> DeleteImageInCloudinary(string imgId)
    {
        var cloudinary = await GetCloudinaryClientAsync();
        var deletionParams = new DeletionParams($"uploads/courses/{imgId}");
        var result = await cloudinary.DestroyAsync(deletionParams);
        if (result.Result == "ok") return false;
        return true;
    }

    public async Task<string> UploadFileToSpacesAsync(Stream fileStream, string fileName, string contentType, string folderPath = null)
    {
        var (s3Client, spacesSettings) = await GetS3ClientAsync();
        
        var folder = !string.IsNullOrEmpty(folderPath) 
            ? folderPath 
            : $"courses/{_currentUserService?.UserId}";
        var request = new PutObjectRequest
        {
            BucketName = spacesSettings.SpaceName,
            Key = $"{folder}/{fileName}",
            InputStream = fileStream,
            ContentType = contentType,
            CannedACL = S3CannedACL.PublicRead
        };
        var response = await s3Client.PutObjectAsync(request);

        if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
        {
            return $"{spacesSettings.CDNEndpoint}/{spacesSettings.SpaceName}/{folder}/{fileName}";
        }
        return null;
    }

    public async Task<bool> DeleteFileFromSpacesAsync(string fileName)
    {
        var (s3Client, spacesSettings) = await GetS3ClientAsync();
        var userId = _currentUserService?.UserId;
        var folder = $"courses/{userId}";
        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = spacesSettings.SpaceName,
            Key = $"{folder}/{fileName}"
        };
        var response = await s3Client.DeleteObjectAsync(deleteRequest);
        return response.HttpStatusCode == System.Net.HttpStatusCode.NoContent;
    }

    public async Task<bool> DeleteObjectByKeyAsync(string fullKey)
    {
        var (s3Client, spacesSettings) = await GetS3ClientAsync();
        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = spacesSettings.SpaceName,
            Key = fullKey
        };
        var response = await s3Client.DeleteObjectAsync(deleteRequest);
        return response.HttpStatusCode == System.Net.HttpStatusCode.NoContent;
    }

    public async Task<string> GeneratePresignedUrl(string fileName, string contentType)
    {
        var (s3Client, spacesSettings) = await GetS3ClientAsync();
        var userId = _currentUserService?.UserId;
        var folder = $"courses/{userId}";
        var key = $"{folder}/{fileName}";
        var duration = 5;

        var request = new GetPreSignedUrlRequest
        {
            BucketName = spacesSettings.SpaceName,
            Key = key,
            Verb = HttpVerb.PUT,
            ContentType = contentType,
            Expires = DateTime.UtcNow.AddMinutes(duration),
        };
        request.Parameters.Add("x-amz-acl", "public-read");
        string url = s3Client.GetPreSignedURL(request);
        return url;
    }

    public async Task<string> GeneratePresignedDownloadUrlAsync(string key, string displayFileName)
    {
        var (s3Client, spacesSettings) = await GetS3ClientAsync();
        var request = new GetPreSignedUrlRequest
        {
            BucketName = spacesSettings.SpaceName,
            Key = key,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddMinutes(60),
            ResponseHeaderOverrides = new ResponseHeaderOverrides
            {
                ContentDisposition = $"attachment; filename=\"{displayFileName}\""
            }
        };

        return s3Client.GetPreSignedURL(request);
    }

    public async Task<(string UploadId, List<string> PresignedUrls)> StartMultipartUploadAsync(string fileName, string contentType, int partsCount)
    {
        var (s3Client, spacesSettings) = await GetS3ClientAsync();
        var userId = _currentUserService?.UserId;
        var folder = $"courses/{userId}";
        var key = $"{folder}/{fileName}";

        var initiateRequest = new InitiateMultipartUploadRequest
        {
            BucketName = spacesSettings.SpaceName,
            Key = key,
            // ContentType = contentType,
            CannedACL = S3CannedACL.PublicRead
        };
        var initResponse = await s3Client.InitiateMultipartUploadAsync(initiateRequest);
        var uploadId = initResponse.UploadId;

        var urls = new List<string>();
        // Sử dụng thời hạn 60 phút để upload hoàn tất các phần
        for (int i = 1; i <= partsCount; i++)
        {
            var presignRequest = new GetPreSignedUrlRequest
            {
                BucketName = spacesSettings.SpaceName,
                Key = key,
                Verb = HttpVerb.PUT,
                Expires = DateTime.UtcNow.AddMinutes(60),
                UploadId = uploadId,
                PartNumber = i
            };
            string url = s3Client.GetPreSignedURL(presignRequest);
            urls.Add(url);
        }

        return (uploadId, urls);
    }

#nullable enable
    public async Task<(bool IsReachable, string? Error)> CheckSpacesConnectionAsync(CancellationToken ct = default)
    {
        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(10));
            var (s3Client, settings) = await GetS3ClientAsync();
            if (string.IsNullOrWhiteSpace(settings.Endpoint) || string.IsNullOrWhiteSpace(settings.SpaceName))
                return (false, "DigitalOcean Spaces endpoint or space name is not configured");
            await s3Client.ListBucketsAsync(cts.Token);
            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, $"[{ex.GetType().Name}] {ex.Message}");
        }
    }

    public async Task<(bool IsReachable, string? Error)> CheckCloudinaryConnectionAsync(CancellationToken ct = default)
    {
        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(5));
            var cloudinary = await GetCloudinaryClientAsync();
            var result = await cloudinary.ListResourcesAsync(new ListResourcesParams { MaxResults = 1 });
            if (result.Error != null)
                return (false, result.Error.Message);
            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }
#nullable restore

    public async Task<bool> CompleteMultipartUploadAsync(string fileName, string uploadId)
    {
        var (s3Client, spacesSettings) = await GetS3ClientAsync();
        var userId = _currentUserService?.UserId;
        var folder = $"courses/{userId}";
        var key = $"{folder}/{fileName}";

        var listPartsRequest = new ListPartsRequest
        {
            BucketName = spacesSettings.SpaceName,
            Key = key,
            UploadId = uploadId
        };
        var listPartsResponse = await s3Client.ListPartsAsync(listPartsRequest);
        var fetchedParts = listPartsResponse.Parts.Select(p => new PartETag(p.PartNumber.GetValueOrDefault(), p.ETag)).ToList();

        var completeRequest = new CompleteMultipartUploadRequest
        {
            BucketName = spacesSettings.SpaceName,
            Key = key,
            UploadId = uploadId,
            PartETags = fetchedParts
        };

        try
        {
            var response = await s3Client.CompleteMultipartUploadAsync(completeRequest);
            return response.HttpStatusCode == System.Net.HttpStatusCode.OK;
        }
        catch (Exception)
        {
            return false;
        }
    }
}

