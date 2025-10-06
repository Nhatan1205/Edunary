using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Application.Courses.Queries.GetCoursesWithPagination;

namespace Edunary.Application.Courses.Queries.GetCoursesAuthorWithPagination;
public class GetCoursesAuthorWithPaginationQuery : IRequest<PaginatedList<GetCoursesAuthorDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetCoursesAuthorWithPaginationQueryHandler : IRequestHandler<GetCoursesAuthorWithPaginationQuery, PaginatedList<GetCoursesAuthorDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    public GetCoursesAuthorWithPaginationQueryHandler(IApplicationDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedList<GetCoursesAuthorDto>> Handle(GetCoursesAuthorWithPaginationQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        return await _context.Courses
            .Where(c => c.CreatedBy == userId)
            .OrderBy(x => x.Title)
            .ProjectTo<GetCoursesAuthorDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}
