using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.CourseTopics.Commands.DeleteCourseTopic;

public record DeleteCourseTopicCommand : IRequest<Result>
{
    public int Id { get; init; }
}

public class DeleteCourseTopicCommandHandler : IRequestHandler<DeleteCourseTopicCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteCourseTopicCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteCourseTopicCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var entity = await _context.CourseTopics
                .Include(t => t.Courses)
                .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

            Guard.Against.NotFound(request.Id, entity);

            if (entity.Courses.Any())
            {
                return Result.Failure($"Cannot delete topic '{entity.Name}' because it is assigned to {entity.Courses.Count} course(s).");
            }

            _context.CourseTopics.Remove(entity);
            var result = await _context.SaveChangesAsync(cancellationToken);

            return result > 0
                ? Result.Success("Course topic deleted successfully.")
                : Result.Failure("Course topic deletion failed.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred: {ex.Message}");
        }
    }
}
