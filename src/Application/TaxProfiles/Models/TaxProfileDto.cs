#nullable enable
namespace Edunary.Application.TaxProfiles.Models;

public class TaxProfileDto
{
    public string RealName { get; set; } = string.Empty;
    public string TaxIdentificationNumber { get; set; } = string.Empty;
    public string TaxCountryCode { get; set; } = string.Empty;
    public string CountryName { get; set; } = string.Empty;
    public decimal WithholdingRate { get; set; }
}
