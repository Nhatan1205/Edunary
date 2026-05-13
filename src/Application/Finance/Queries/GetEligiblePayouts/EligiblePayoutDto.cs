namespace Edunary.Application.Finance.Queries.GetEligiblePayouts;

public class EligiblePayoutDto
{
    public string InstructorId { get; init; }
    public string InstructorName { get; init; }
    public string InstructorEmail { get; init; }
    public decimal NetBalance { get; init; }
    public string Currency { get; init; } = "USD";
}
