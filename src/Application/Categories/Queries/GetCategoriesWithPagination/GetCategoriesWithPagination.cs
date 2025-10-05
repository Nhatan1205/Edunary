using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper.QueryableExtensions;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Application.TodoItems.Queries.GetTodoItemsWithPagination;

namespace Edunary.Application.Categories.Queries.GetCategoriesWithPagination;


public record GetCategoriesWithPaginationQuery : IRequest<PaginatedList<CategoryDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetCategoriesWithPaginationQueryHandler : IRequestHandler<GetCategoriesWithPaginationQuery, PaginatedList<CategoryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetCategoriesWithPaginationQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PaginatedList<CategoryDto>> Handle(GetCategoriesWithPaginationQuery request, CancellationToken cancellationToken)
    {
        return await _context.Categories
            .OrderBy(x => x.Title)
            .ProjectTo<CategoryDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}
