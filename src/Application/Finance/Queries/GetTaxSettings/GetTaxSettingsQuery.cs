using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Finance.Queries.GetTaxSettings;

public record GetTaxSettingsQuery : IRequest<TaxSettingsDto>;

public class GetTaxSettingsQueryHandler : IRequestHandler<GetTaxSettingsQuery, TaxSettingsDto>
{
    private readonly IApplicationDbContext _context;

    public GetTaxSettingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TaxSettingsDto> Handle(GetTaxSettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await _context.SystemSettings
            .AsNoTracking()
            .Where(s => s.Key == SettingKey.Tax_DefaultVatRate || s.Key == SettingKey.Tax_DefaultWithholdingRate)
            .ToListAsync(cancellationToken);

        var vatRateSetting = settings.FirstOrDefault(s => s.Key == SettingKey.Tax_DefaultVatRate);
        var withholdingRateSetting = settings.FirstOrDefault(s => s.Key == SettingKey.Tax_DefaultWithholdingRate);

        var vatRate = 0m;
        if (vatRateSetting?.Value != null && decimal.TryParse(vatRateSetting.Value, out var parsed))
            vatRate = parsed;

        var withholdingRate = 0.30m; // default fallback
        if (withholdingRateSetting?.Value != null && decimal.TryParse(withholdingRateSetting.Value, out var parsed2))
            withholdingRate = parsed2;

        return new TaxSettingsDto
        {
            DefaultVatRate = vatRate,
            DefaultWithholdingRate = withholdingRate
        };
    }
}
