using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.MediaFiles.Commands.UnsetCourseIdForAllContentsCommand;
using Edunary.Domain.Enums;
using Edunary.Domain.Events.Courses;

namespace Edunary.Application.Courses.Commands.DeleteCourse;
[ActivityLog(ActivityType.DeleteCourse, "Deleted a course")]
public record DeleteCourseCommand : IRequest<Result>
{
    public int Id { get; init; }
}

public class DeleteCourseCommandHandler : IRequestHandler<DeleteCourseCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUploadFileService _uploadFileService;
    private readonly ISender _sender;
    
    public DeleteCourseCommandHandler(
        IApplicationDbContext context, 
        ICurrentUserService currentUserService, 
        IUploadFileService uploadFileService,
        ISender sender)
    {
        _context = context;
        _currentUserService = currentUserService;
        _uploadFileService = uploadFileService;
        _sender = sender;
    }
    public async Task<Result> Handle(DeleteCourseCommand request, CancellationToken cancellationToken)
    {
        try
        {
            
            var entity = await _context.Courses
                .FindAsync(new object[] { request.Id }, cancellationToken);
            Guard.Against.NotFound(request.Id, entity);

            var userId = _currentUserService?.UserId;
            var imgLink = entity.ImageUrl;
            var courseTitle = entity.Title;
            var totalStudents = entity.TotalStudents;
            if (entity.CreatedBy != userId)
            {
                return Result.Failure("You are not authorized to delete this course.");
            }

            if (totalStudents > 0)
            {
                return Result.Failure("Cannot delete course with enrolled students.");
            }

            // Release all videos associated with this course
            var unsetCommand = new UnsetCourseIdForAllContentsCommand
            {
                CourseId = request.Id
            };
            await _sender.Send(unsetCommand, cancellationToken);

            // Remove all carts containing this course
            var courseIdAsString = request.Id.ToString();
            var cartsToRemove = await _context.Carts
                .Where(c => c.CourseId == courseIdAsString)
                .ToListAsync(cancellationToken);

            int cartsRemovedCount = 0;
            if (cartsToRemove.Any())
            {
                _context.Carts.RemoveRange(cartsToRemove);
                cartsRemovedCount = cartsToRemove.Count;
            }

            _context.Courses.Remove(entity);
            if (!string.IsNullOrEmpty(imgLink))
            {   
                var imgId = $"{userId}-{request.Id}-{courseTitle}";
                await _uploadFileService.DeleteImageInCloudinary(imgId);
            }
            var result = await _context.SaveChangesAsync(cancellationToken);
            if (result > 0)
            {
        return Result.Success($"Course with ID {request.Id} deleted successfully.");
            }
            return Result.Failure("Course deleted unsuccessfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred while deleting course: {ex.Message}");
        }
    }
}

