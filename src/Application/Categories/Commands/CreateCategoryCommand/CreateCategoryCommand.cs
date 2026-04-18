using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Categories.Commands.CreateCategoryCommand;

public record CreateCategoryCommand : IRequest<ReturnResult<CreatedCategoryDto>>
{
    public string Title { get; init; } = string.Empty;
}

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, ReturnResult<CreatedCategoryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateCategoryCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ReturnResult<CreatedCategoryDto>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Check duplicate title
            var titleLower = request.Title.Trim().ToLower();
            var exists = await _context.Categories
                .AnyAsync(c => c.Title.ToLower() == titleLower, cancellationToken);

            if (exists)
            {
                return new ReturnResult<CreatedCategoryDto>
                {
                    Result = null,
                    Message = $"A category with the title '{request.Title}' already exists."
                };
            }

            var category = new Category
            {
                Title = request.Title.Trim()
            };

            _context.Categories.Add(category);
            var result = await _context.SaveChangesAsync(cancellationToken);

            if (result > 0)
            {
                return new ReturnResult<CreatedCategoryDto>
                {
                    Result = _mapper.Map<CreatedCategoryDto>(category),
                    Message = "Category created successfully."
                };
            }

            return new ReturnResult<CreatedCategoryDto>
            {
                Result = null,
                Message = "Category creation failed."
            };
        }
        catch (Exception ex)
        {
            return new ReturnResult<CreatedCategoryDto>
            {
                Result = null,
                Message = $"An unexpected error occurred: {ex.Message}"
            };
        }
    }
}
