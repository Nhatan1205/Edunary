using System.ComponentModel.DataAnnotations;

namespace Edunary.Domain.Entities;

public class TaxRegion
{
    public string CountryCode { get; set; } = string.Empty;

    [MaxLength(100)]
    public string CountryName { get; set; } = string.Empty;

    public decimal VatRate { get; set; }
    public decimal WithholdingRate { get; set; } = 0.30m;
    public bool IsActive { get; set; } = true;
}
