using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class FinancialAccount
{
    public string AccountCode { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public AccountKind Kind { get; set; }
    public bool IsPerUser { get; set; }
}
