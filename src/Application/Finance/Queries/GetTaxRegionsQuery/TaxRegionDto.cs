namespace Edunary.Application.Finance.Queries.GetTaxRegionsQuery;

public class TaxRegionDto
{
    public string CountryCode { get; set; } = string.Empty;
    public string CountryName { get; set; } = string.Empty;
    public decimal VatRate { get; set; }
    public decimal WithholdingRate { get; set; }
}
