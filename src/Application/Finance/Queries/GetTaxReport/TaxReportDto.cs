namespace Edunary.Application.Finance.Queries.GetTaxReport;

public class TaxReportDto
{
    public string Period { get; init; }
    public List<VatByRegionDto> VatByRegion { get; init; } = new();
    public decimal TotalVatCollected { get; init; }
    public decimal TotalWithholdingTax { get; init; }
}

public class VatByRegionDto
{
    public string CountryCode { get; init; }
    public decimal VatAmount { get; init; }
    public int OrderCount { get; init; }
}
