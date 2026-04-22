using Edunary.Domain.Entities;

namespace Edunary.Application.InstructorWallets.Queries.GetInstructorWallet;

public class InstructorWalletDto
{
    public int Id { get; set; }
    public decimal Balance { get; set; }

    public decimal TotalWithdrawn { get; set; }

    public decimal PendingWithdrawal { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<InstructorWallet, InstructorWalletDto>();
        }
    }
}
