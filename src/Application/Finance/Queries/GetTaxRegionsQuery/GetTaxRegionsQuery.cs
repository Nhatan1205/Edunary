using Edunary.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Finance.Queries.GetTaxRegionsQuery;

public record GetTaxRegionsQuery : IRequest<List<TaxRegionDto>>;

public class GetTaxRegionsQueryHandler : IRequestHandler<GetTaxRegionsQuery, List<TaxRegionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTaxRegionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TaxRegionDto>> Handle(GetTaxRegionsQuery request, CancellationToken cancellationToken)
    {
        return await _context.TaxRegions
            .Where(r => r.IsActive)
            .OrderBy(r => r.CountryCode)
            .Select(r => new TaxRegionDto { CountryCode = r.CountryCode, CountryName = r.CountryName, VatRate = r.VatRate })
            .ToListAsync(cancellationToken);
    }
}
