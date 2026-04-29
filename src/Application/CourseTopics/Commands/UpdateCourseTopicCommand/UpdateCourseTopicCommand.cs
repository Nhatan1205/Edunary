using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.CourseTopics.Commands.UpdateCourseTopic;

public record UpdateCourseTopicCommand : IRequest<Result>
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
}

public class UpdateCourseTopicCommandHandler : IRequestHandler<UpdateCourseTopicCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateCourseTopicCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(UpdateCourseTopicCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var entity = await _context.CourseTopics
                .FindAsync(new object[] { request.Id }, cancellationToken);
            Guard.Against.NotFound(request.Id, entity);

            var duplicate = await _context.CourseTopics
                .AnyAsync(t => t.Name.ToLower() == request.Name.Trim().ToLower() && t.Id != request.Id, cancellationToken);

            if (duplicate)
                return Result.Failure($"Topic '{request.Name}' already exists.");

            entity.Name = request.Name.Trim();

            var result = await _context.SaveChangesAsync(cancellationToken);
            return result > 0
                ? Result.Success("Course topic updated successfully.")
                : Result.Failure("Course topic update failed.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred: {ex.Message}");
        }
    }
}
