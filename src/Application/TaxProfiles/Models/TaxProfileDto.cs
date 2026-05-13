#nullable enable
namespace Edunary.Application.TaxProfiles.Models;

public class TaxProfileDto
{
    public string TaxCountryCode { get; set; } = string.Empty;
    public bool HasSubmittedW8Ben { get; set; }
    public DateTimeOffset? W8BenSubmittedAt { get; set; }
    public decimal WithholdingRate { get; set; }
    public DateTimeOffset? LastReviewedAt { get; set; }
}
