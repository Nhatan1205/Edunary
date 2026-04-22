using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;

namespace Edunary.Application.InstructorWallets.Queries.GetInstructorWallet;

public class GetInstructorWalletQuery : IRequest<InstructorWalletDto>
{
}

public class GetInstructorWalletQueryHandler : IRequestHandler<GetInstructorWalletQuery, InstructorWalletDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetInstructorWalletQueryHandler(
        IApplicationDbContext context,
        IMapper mapper,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<InstructorWalletDto> Handle(GetInstructorWalletQuery request, CancellationToken cancellationToken)
    {
        var instructorId = _currentUserService?.UserId;

        if (string.IsNullOrWhiteSpace(instructorId))
        {
            return new InstructorWalletDto
            {
                Id = 0,
                Balance = 0m,
                TotalWithdrawn = 0m
            };
        }

        var wallet = await _context.InstructorWallets
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.InstructorId == instructorId, cancellationToken);

        if (wallet is null)
        {
            return new InstructorWalletDto
            {
                Id = 0,
                Balance = 0m,
                TotalWithdrawn = 0m
            };
        }

        var pendingWithdrawalsAmount = await _context.WithdrawalRequests
            .AsNoTracking()
            .Where(t => t.InstructorWalletId == wallet.Id
                && t.Status == InstructorWalletTransactionStatus.Processing)
            .SumAsync(t => (decimal?)t.Amount, cancellationToken) ?? 0m;

        var dto = _mapper.Map<InstructorWalletDto>(wallet);
        dto.Balance = Math.Max(0m, dto.Balance - pendingWithdrawalsAmount);
        dto.PendingWithdrawal = Math.Max(0m, pendingWithdrawalsAmount);

        return dto;
    }
}
