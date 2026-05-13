namespace Edunary.Domain.Entities;

public class TaxProfile
{
    public string InstructorId { get; set; } = string.Empty;
    public string TaxCountryCode { get; set; } = string.Empty;
    public bool HasSubmittedW8Ben { get; set; }
    public DateTimeOffset? W8BenSubmittedAt { get; set; }
    public decimal WithholdingRate { get; set; } = 0.30m;
    public DateTimeOffset? LastReviewedAt { get; set; }
}
