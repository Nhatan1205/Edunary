using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;

namespace Edunary.Application.Finance.Payouts;

[Authorize(Roles = Roles.Administrator)]
public record GetPayoutSettingsQuery : IRequest<PayoutSettingsDto>;

public class GetPayoutSettingsQueryHandler : IRequestHandler<GetPayoutSettingsQuery, PayoutSettingsDto>
{
    private readonly PayoutEligibilityService _payoutEligibilityService;

    public GetPayoutSettingsQueryHandler(PayoutEligibilityService payoutEligibilityService)
    {
        _payoutEligibilityService = payoutEligibilityService;
    }

    public async Task<PayoutSettingsDto> Handle(GetPayoutSettingsQuery request, CancellationToken cancellationToken)
    {
        return new PayoutSettingsDto
        {
            MinimumThresholdUsd = await _payoutEligibilityService.GetMinimumThresholdUsdAsync(cancellationToken)
        };
    }
}
