using Edunary.Application.Finance.Payouts;

namespace Edunary.Application.Finance.Queries.GetEligiblePayouts;

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
