using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Events.Courses;

namespace Edunary.Application.Courses.Commands.DeleteCourse;
public record DeleteCourseCommand : IRequest<Result>
{
    public int Id { get; init; }
}

public class DeleteCourseCommandHandler : IRequestHandler<DeleteCourseCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IImageService _imageService;
    public DeleteCourseCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService, IImageService imageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _imageService = imageService;
    }
    public async Task<Result> Handle(DeleteCourseCommand request, CancellationToken cancellationToken)
    {
        try
        {
            
            var entity = await _context.Courses
                .FindAsync(new object[] { request.Id }, cancellationToken);
            Guard.Against.NotFound(request.Id, entity);

            var userId = _currentUserService?.UserId;
            if (entity.CreatedBy != userId)
            {
                return Result.Failure("You are not authorized to delete this course.");
            }
            
            _context.Courses.Remove(entity);

            await _imageService.DeleteImageAsync(entity.Id.ToString());
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

