namespace Edunary.Application.Finance.Payouts;

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
