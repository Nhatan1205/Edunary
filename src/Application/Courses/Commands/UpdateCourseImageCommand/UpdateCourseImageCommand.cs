using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Courses.Commands.UpdateCourseImageCommand;
public class UpdateCourseImageCommand : IRequest<Result>
{
    public int Id { get; init; }
    public FileUploadDto Image { get; init; }
}

public class UpdateCourseImageCommandHandler : IRequestHandler<UpdateCourseImageCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IImageService _imageService;
    public UpdateCourseImageCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService, IImageService imageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _imageService = imageService;

    }
    public async Task<Result> Handle(UpdateCourseImageCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var entity = await _context.Courses
            .FindAsync(new object[] { request.Id }, cancellationToken);
            Guard.Against.NotFound(request.Id, entity);
            var userId = _currentUserService?.UserId;
            if (entity.CreatedBy != userId)
            {
                return Result.Failure("You are not authorized to update this course.");
            }
            var uploadResult = await _imageService.AddImageAsync(request.Image.Stream, request.Image.FileName, entity.Id.ToString());
            entity.ImageUrl = uploadResult.Url;

            await _context.SaveChangesAsync(cancellationToken);
            return Result.Success("Course image updated successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred while updating course image: {ex.Message}");
        }
    }
}
