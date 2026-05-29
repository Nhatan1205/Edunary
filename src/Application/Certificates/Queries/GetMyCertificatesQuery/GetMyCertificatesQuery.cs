using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Edunary.Application.Common.Mappings;

namespace Edunary.Application.Certificates.Queries.GetMyCertificatesQuery;

public class GetMyCertificatesQuery : IRequest<PaginatedList<MyCertificateDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetMyCertificatesQueryHandler : IRequestHandler<GetMyCertificatesQuery, PaginatedList<MyCertificateDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetMyCertificatesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService, IMapper mapper)
    {
        _context = context;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<PaginatedList<MyCertificateDto>> Handle(GetMyCertificatesQuery request, CancellationToken cancellationToken)
    {
        return await _context.CourseCertificates
            .Where(c => c.StudentId == _currentUserService.UserId)
            .OrderByDescending(c => c.CompletedDate)
            .ProjectTo<MyCertificateDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}
