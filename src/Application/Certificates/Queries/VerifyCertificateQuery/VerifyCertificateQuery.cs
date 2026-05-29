using Edunary.Application.Common.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Certificates.Queries.VerifyCertificateQuery;

public class VerifyCertificateQuery : IRequest<VerifyCertificateDto>
{
    public string CertificateNumber { get; init; } = string.Empty;
}

public class VerifyCertificateQueryHandler : IRequestHandler<VerifyCertificateQuery, VerifyCertificateDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public VerifyCertificateQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<VerifyCertificateDto> Handle(VerifyCertificateQuery request, CancellationToken cancellationToken)
    {
        var result = await _context.CourseCertificates
            .Where(c => c.CertificateNumber == request.CertificateNumber)
            .ProjectTo<VerifyCertificateDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
            
        return result!;
    }
}
