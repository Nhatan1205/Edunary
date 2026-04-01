using Edunary.Application.Common.Models;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.MediaFiles.Commands.DeleteMediaFileCommand;
public class DeleteMediaFileCommand : IRequest<Result>
{
    public int Id { get; set; }
}
public class DeleteMediaFileCommandHandler : IRequestHandler<DeleteMediaFileCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IUploadFileService _uploadFileService;

    public DeleteMediaFileCommandHandler(
        IApplicationDbContext context,
        IUploadFileService uploadFileService)
    {
        _context = context;
        _uploadFileService = uploadFileService;
    }

    public async Task<Result> Handle(DeleteMediaFileCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.MediaFiles.FindAsync(new object[] { request.Id }, cancellationToken);
        Guard.Against.NotFound(request.Id, entity);

        // temporary comment the logic for deleting content on server
        // var fileName = entity.FileName;
        // var deleteFileResult = await _uploadFileService.DeleteFileFromSpacesAsync(fileName);
        // if (deleteFileResult)
        // {
        //     _context.CourseContents.Remove(entity);
        //     var result = await _context.SaveChangesAsync(cancellationToken);
        //     if (result > 0)
        //     {
        //         return Result.Success($"Deleted successfully.");
        //     }
        //     else
        //     {
        //         return Result.Failure("Failed to delete this course content.");
        //     }
        // }
        // else
        // {
        //     return Result.Failure("Failed to delete the file from storage.");
        // }
        entity.IsDeleted = true;
        var result = await _context.SaveChangesAsync(cancellationToken);
        if (result > 0)
        {
            return Result.Success($"Deleted successfully.");
        }
        else
        {
            return Result.Failure("Failed to delete this course content.");
        }
    }
}