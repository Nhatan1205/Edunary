using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Finance.Queries.GetEligiblePayouts;

[Authorize(Roles = Roles.Administrator)]
public record GetEligiblePayoutsQuery : IRequest<List<EligiblePayoutDto>>
{
    public DateTimeOffset? AsOf { get; init; }
}

public class GetEligiblePayoutsQueryHandler : IRequestHandler<GetEligiblePayoutsQuery, List<EligiblePayoutDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetEligiblePayoutsQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<List<EligiblePayoutDto>> Handle(GetEligiblePayoutsQuery request, CancellationToken cancellationToken)
    {
        var thresholdSetting = await _context.SystemSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Key == SettingKey.Payout_MinThresholdUsd, cancellationToken);

        var threshold = 25m;
        if (decimal.TryParse(thresholdSetting?.Value, out var parsed))
            threshold = parsed;

        var eligible = await _context.UserAccountBalances
            .AsNoTracking()
            .Where(b => b.AccountCode == LedgerAccountCode.InstructorNetBalance && b.Balance >= threshold)
            .Select(b => new { b.UserId, b.Balance, b.Currency })
            .ToListAsync(cancellationToken);

        if (eligible.Count == 0)
            return new List<EligiblePayoutDto>();

        var userIds = eligible.Select(e => e.UserId).ToList();
        var users = await _identityService.GetUserIdentitiesByIdsAsync(userIds, cancellationToken);
        var userMap = users.ToDictionary(u => u.Id, u => u);

        return eligible.Select(e =>
        {
            userMap.TryGetValue(e.UserId, out var user);
            return new EligiblePayoutDto
            {
                InstructorId = e.UserId,
                InstructorName = user?.FullName ?? e.UserId,
                InstructorEmail = user?.Email ?? string.Empty,
                NetBalance = e.Balance,
                Currency = e.Currency ?? "USD",
            };
        })
        .OrderByDescending(e => e.NetBalance)
        .ToList();
    }
}
