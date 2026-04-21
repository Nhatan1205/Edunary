using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using MediatR;

namespace Edunary.Application.MediaFiles.Commands.CompleteMultipartUpload;

public class PartETagDto
{
    public int PartNumber { get; set; }
    public string ETag { get; set; } = null!;
}

public class CompleteMultipartUploadCommand : IRequest<ReturnResult<bool>>
{
    public string FileName { get; set; } = null!;
    public string UploadId { get; set; } = null!;
}

public class CompleteMultipartUploadCommandHandler : IRequestHandler<CompleteMultipartUploadCommand, ReturnResult<bool>>
{
    private readonly IUploadFileService _uploadFileService;

    public CompleteMultipartUploadCommandHandler(IUploadFileService uploadFileService)
    {
        _uploadFileService = uploadFileService;
    }

    public async Task<ReturnResult<bool>> Handle(CompleteMultipartUploadCommand request, CancellationToken cancellationToken)
    {
        var result = new ReturnResult<bool>();

        var isSuccess = await _uploadFileService.CompleteMultipartUploadAsync(request.FileName, request.UploadId);

        if (isSuccess)
        {
            result.Message = "Multipart upload completed successfully.";
            result.Result = true;
        }
        else
        {
            result.Message = "Failed to complete multipart upload.";
            result.Result = false;
        }

        return result;
    }
}
