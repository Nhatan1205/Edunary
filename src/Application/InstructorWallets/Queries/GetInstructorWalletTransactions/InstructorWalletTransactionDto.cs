using Edunary.Domain.Enums;

namespace Edunary.Application.InstructorWallets.Queries.GetInstructorWalletTransactions;

public class InstructorWalletTransactionDto
{
    public int Id { get; set; }
    public DateTimeOffset Created { get; set; }
    public int OrderId { get; set; }
    public int CourseId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public InstructorWalletTransactionStatus Status { get; set; }
}
