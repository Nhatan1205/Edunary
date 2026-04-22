namespace Edunary.Domain.Entities;

public class InstructorWalletTransaction : BaseAuditableEntity
{
    public int InstructorWalletId { get; set; }
    public InstructorWallet InstructorWallet { get; set; } = null!;

    public int OrderId { get; set; }
    public int CourseId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
}
