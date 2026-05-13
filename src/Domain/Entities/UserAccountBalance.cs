namespace Edunary.Domain.Entities;

public class UserAccountBalance
{
    public string UserId { get; set; } = string.Empty;
    public string AccountCode { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public DateTimeOffset LastUpdatedAt { get; set; }
}
