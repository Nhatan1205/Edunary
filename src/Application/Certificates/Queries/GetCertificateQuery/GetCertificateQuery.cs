using Edunary.Application.Common.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Certificates.Queries.GetCertificateQuery;

#nullable enable
public class GetCertificateQuery : IRequest<CertificateDto>
{
    public int CourseId { get; init; }
}

public class GetCertificateQueryHandler : IRequestHandler<GetCertificateQuery, CertificateDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetCertificateQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService, IMapper mapper)
    {
        _context = context;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<CertificateDto> Handle(GetCertificateQuery request, CancellationToken cancellationToken)
    {
        var result = await _context.CourseCertificates
            .Where(c => c.CourseId == request.CourseId && c.StudentId == _currentUserService.UserId)
            .ProjectTo<CertificateDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
            
        return result!;
    }
}
