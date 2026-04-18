using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Categories.Commands.UpdateCategoryCommand;

public class UpdateCategoryCommand : IRequest<Result>
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
}

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var category = await _context.Categories
                .FindAsync(new object[] { request.Id }, cancellationToken);

            Guard.Against.NotFound(request.Id, category);

            // Check duplicate title — exclude the current category itself
            var titleLower = request.Title.Trim().ToLower();
            var duplicateExists = await _context.Categories
                .AnyAsync(c => c.Title.ToLower() == titleLower && c.Id != request.Id, cancellationToken);

            if (duplicateExists)
            {
                return Result.Failure($"A category with the title '{request.Title}' already exists.");
            }

            category.Title = request.Title.Trim();

            var result = await _context.SaveChangesAsync(cancellationToken);

            return result > 0
                ? Result.Success(message: "Category updated successfully.")
                : Result.Failure("Category update failed.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred: {ex.Message}");
        }
    }
}
