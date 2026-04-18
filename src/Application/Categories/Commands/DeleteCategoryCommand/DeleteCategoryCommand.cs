using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Categories.Commands.DeleteCategoryCommand;

public record DeleteCategoryCommand : IRequest<Result>
{
    public int Id { get; init; }
}

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var category = await _context.Categories
                .FindAsync(new object[] { request.Id }, cancellationToken);

            Guard.Against.NotFound(request.Id, category);

            // Block deletion if courses are using this category
            var courseCount = await _context.Courses
                .CountAsync(c => c.CategoryId == request.Id, cancellationToken);

            if (courseCount > 0)
            {
                return Result.Failure(
                    $"Cannot delete this category. There are {courseCount} course(s) currently using it. "
                );
            }

            _context.Categories.Remove(category);
            var result = await _context.SaveChangesAsync(cancellationToken);

            return result > 0
                ? Result.Success(message: "Category deleted successfully.")
                : Result.Failure("Category deletion failed.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred: {ex.Message}");
        }
    }
}
