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
        decimal rate;

        var profile = await _context.TaxProfiles
            .FirstOrDefaultAsync(p => p.InstructorId == instructorId, ct);

        if (profile != null)
        {
            rate = profile.WithholdingRate;
        }
        else
        {
            var setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == SettingKey.Tax_DefaultWithholdingRate, ct);

            rate = setting?.Value != null && decimal.TryParse(setting.Value, out var parsed)
                ? parsed
                : 0.30m;
        }

        var taxAmount = Math.Round(grossEarnings * rate, 4, MidpointRounding.ToEven);
        return new TaxResult(rate, taxAmount);
    }
}
