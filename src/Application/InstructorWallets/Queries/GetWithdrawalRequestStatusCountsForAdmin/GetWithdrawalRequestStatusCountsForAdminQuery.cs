using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.InstructorWallets.Queries.GetWithdrawalRequestStatusCountsForAdmin;

public record GetWithdrawalRequestStatusCountsForAdminQuery
    : IRequest<AdminWithdrawalRequestStatusCountsDto>;

public class GetWithdrawalRequestStatusCountsForAdminQueryHandler
    : IRequestHandler<GetWithdrawalRequestStatusCountsForAdminQuery, AdminWithdrawalRequestStatusCountsDto>
{
    private readonly IApplicationDbContext _context;

    public GetWithdrawalRequestStatusCountsForAdminQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminWithdrawalRequestStatusCountsDto> Handle(
        GetWithdrawalRequestStatusCountsForAdminQuery request,
        CancellationToken cancellationToken)
    {
        var counts = await _context.WithdrawalRequests
            .AsNoTracking()
            .GroupBy(w => w.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var dto = new AdminWithdrawalRequestStatusCountsDto();

        foreach (var item in counts)
        {
            dto.Total += item.Count;
            switch (item.Status)
            {
                case InstructorWalletTransactionStatus.Processing:
                    dto.Processing = item.Count;
                    break;
                case InstructorWalletTransactionStatus.Succeeded:
                    dto.Succeeded = item.Count;
                    break;
                case InstructorWalletTransactionStatus.Cancelled:
                    dto.Cancelled = item.Count;
                    break;
            }
        }

        return dto;
    }
}
