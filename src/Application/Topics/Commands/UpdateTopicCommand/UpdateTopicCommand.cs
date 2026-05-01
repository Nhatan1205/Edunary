using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Topics.Commands.UpdateTopicCommand;
public record UpdateTopicCommand : IRequest<Result>
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
}

public class UpdateTopicCommandHandler : IRequestHandler<UpdateTopicCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateTopicCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(UpdateTopicCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var entity = await _context.Topics
                .FindAsync(new object[] { request.Id }, cancellationToken);
            Guard.Against.NotFound(request.Id, entity);

            var duplicate = await _context.Topics
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
