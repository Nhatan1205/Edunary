using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Services;

internal interface ITaxStrategy
{
    decimal CalculateVat(decimal baseAmount, decimal vatRate);
}

internal class DefaultTaxStrategy : ITaxStrategy
{
    public decimal CalculateVat(decimal baseAmount, decimal vatRate)
        => Math.Round(baseAmount * vatRate, 4, MidpointRounding.ToEven);
}

public class TaxCalculatorService : ITaxCalculatorService
{
    private readonly IApplicationDbContext _context;
    private readonly ITaxStrategy _strategy;

    public TaxCalculatorService(IApplicationDbContext context)
    {
        _context = context;
        _strategy = new DefaultTaxStrategy();
    }

    public async Task<TaxResult> CalculateVatAsync(string countryCode, decimal baseAmount, CancellationToken ct)
    {
        decimal rate = 0m;

        if (!string.IsNullOrEmpty(countryCode))
        {
            var region = await _context.TaxRegions
                .FirstOrDefaultAsync(r => r.CountryCode == countryCode && r.IsActive, ct);

            if (region != null)
            {
                rate = region.VatRate;
            }
            else
            {
                var setting = await _context.SystemSettings
                    .FirstOrDefaultAsync(s => s.Key == SettingKey.Tax_DefaultVatRate, ct);

                if (setting?.Value != null && decimal.TryParse(setting.Value, out var parsed))
                    rate = parsed;
            }
        }

        var taxAmount = _strategy.CalculateVat(baseAmount, rate);
        return new TaxResult(rate, taxAmount);
    }

    public async Task<TaxResult> CalculateWithholdingAsync(string instructorId, decimal grossEarnings, CancellationToken ct)
    {
        decimal? rate = null;

        var profile = await _context.TaxProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.InstructorId == instructorId, ct);

        if (!string.IsNullOrWhiteSpace(profile?.TaxCountryCode))
        {
            var countryCode = profile.TaxCountryCode.Trim().ToUpperInvariant();
            var region = await _context.TaxRegions
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.CountryCode == countryCode && r.IsActive, ct);

            if (region != null)
            {
                rate = region.WithholdingRate;
            }
        }

        var effectiveRate = rate ?? await GetDefaultWithholdingRateAsync(ct);
        var taxAmount = Math.Round(grossEarnings * effectiveRate, 4, MidpointRounding.ToEven);
        return new TaxResult(effectiveRate, taxAmount);
    }

    private async Task<decimal> GetDefaultWithholdingRateAsync(CancellationToken ct)
    {
        var setting = await _context.SystemSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Key == SettingKey.Tax_DefaultWithholdingRate, ct);

        return setting?.Value != null && decimal.TryParse(setting.Value, out var parsed)
            ? parsed
            : 0.30m;
    }
}
