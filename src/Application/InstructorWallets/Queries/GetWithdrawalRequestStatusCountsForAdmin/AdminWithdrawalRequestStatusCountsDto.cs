namespace Edunary.Application.InstructorWallets.Queries.GetWithdrawalRequestStatusCountsForAdmin;

public class AdminWithdrawalRequestStatusCountsDto
{
    public int Total { get; set; }
    public int Processing { get; set; }
    public int Succeeded { get; set; }
    public int Cancelled { get; set; }
}
