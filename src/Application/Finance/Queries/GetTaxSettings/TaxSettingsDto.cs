namespace Edunary.Application.Finance.Queries.GetTaxSettings;

public class TaxSettingsDto
{
    public decimal DefaultVatRate { get; set; }
    public decimal DefaultWithholdingRate { get; set; }
}
