using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Topics.Commands.DeleteTopicCommand;
public record DeleteTopicCommand : IRequest<Result>
{
    public int Id { get; init; }
}

public class DeleteTopicCommandHandler : IRequestHandler<DeleteTopicCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteTopicCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteTopicCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var entity = await _context.Topics
                .Include(t => t.Courses)
                .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

            Guard.Against.NotFound(request.Id, entity);

            if (entity.Courses.Any())
            {
                return Result.Failure($"Cannot delete topic '{entity.Name}' because it is assigned to {entity.Courses.Count} course(s).");
            }

            _context.Topics.Remove(entity);
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
