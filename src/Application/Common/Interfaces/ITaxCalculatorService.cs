using Edunary.Application.Common.Models;

namespace Edunary.Application.Common.Interfaces;

public interface ITaxCalculatorService
{
    Task<TaxResult> CalculateVatAsync(string countryCode, decimal baseAmount, CancellationToken ct);
    Task<TaxResult> CalculateWithholdingAsync(string instructorId, decimal grossEarnings, CancellationToken ct);
}
