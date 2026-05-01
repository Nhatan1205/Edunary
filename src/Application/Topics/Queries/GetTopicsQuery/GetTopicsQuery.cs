using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Topics.Queries.GetTopicsQuery;
public record GetTopicsQuery : IRequest<PaginatedList<GetTopicDto>>
{
    public string SearchText { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public class GetTopicsQueryHandler : IRequestHandler<GetTopicsQuery, PaginatedList<GetTopicDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetTopicsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PaginatedList<GetTopicDto>> Handle(GetTopicsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Topics
            .Include(t => t.Courses)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var search = request.SearchText.Trim().ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(search));
        }

        return await query
            .OrderBy(t => t.Name)
            .ProjectTo<GetTopicDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}

