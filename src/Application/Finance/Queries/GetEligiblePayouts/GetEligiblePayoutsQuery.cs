using Edunary.Application.Common.Security;
using Edunary.Application.Finance.Payouts;
using Edunary.Domain.Constants;

namespace Edunary.Application.Finance.Queries.GetEligiblePayouts;

[Authorize(Roles = Roles.Administrator)]
public record GetEligiblePayoutsQuery : IRequest<List<EligiblePayoutDto>>;

public class GetEligiblePayoutsQueryHandler : IRequestHandler<GetEligiblePayoutsQuery, List<EligiblePayoutDto>>
{
    private readonly PayoutEligibilityService _payoutEligibilityService;

    public GetEligiblePayoutsQueryHandler(PayoutEligibilityService payoutEligibilityService)
    {
        _payoutEligibilityService = payoutEligibilityService;
    }

    public async Task<List<EligiblePayoutDto>> Handle(GetEligiblePayoutsQuery request, CancellationToken cancellationToken)
    {
        var candidates = await _payoutEligibilityService.GetCandidatesAsync(cancellationToken);
        return candidates.Select(c => c.ToDto()).ToList();
    }
}
