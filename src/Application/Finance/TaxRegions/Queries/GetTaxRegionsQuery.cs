using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Finance.TaxRegions.Queries;

[Authorize(Roles = Roles.Administrator)]
public record GetTaxRegionsQuery : IRequest<List<TaxRegionDto>>;

public class TaxRegionDto
{
    public string CountryCode { get; init; } = string.Empty;
    public string CountryName { get; init; } = string.Empty;
    public decimal VatRate { get; init; }
    public decimal WithholdingRate { get; init; }
    public bool IsActive { get; init; }
}

public class GetTaxRegionsQueryHandler : IRequestHandler<GetTaxRegionsQuery, List<TaxRegionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTaxRegionsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<TaxRegionDto>> Handle(GetTaxRegionsQuery request, CancellationToken cancellationToken)
    {
        return await _context.TaxRegions
            .AsNoTracking()
            .OrderBy(r => r.CountryCode)
            .Select(r => new TaxRegionDto
            {
                CountryCode = r.CountryCode,
                CountryName = r.CountryName,
                VatRate = r.VatRate,
                WithholdingRate = r.WithholdingRate,
                IsActive = r.IsActive
            })
            .ToListAsync(cancellationToken);
    }
}
