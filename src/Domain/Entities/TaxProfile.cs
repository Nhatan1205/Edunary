namespace Edunary.Domain.Entities;

public class TaxProfile
{
    public string InstructorId { get; set; } = string.Empty;
    public string RealName { get; set; } = string.Empty;
    public string TaxIdentificationNumber { get; set; } = string.Empty;
    public string TaxCountryCode { get; set; } = string.Empty;
}
