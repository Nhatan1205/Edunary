using System.Globalization;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;
using Edunary.Domain.Entities;

namespace Edunary.Application.Finance.Payouts;

[Authorize(Roles = Roles.Administrator)]
public record UpdatePayoutSettingsCommand : IRequest<Result>
{
    public decimal MinimumThresholdUsd { get; init; }
}

public class UpdatePayoutSettingsCommandValidator : AbstractValidator<UpdatePayoutSettingsCommand>
{
    public UpdatePayoutSettingsCommandValidator()
    {
        RuleFor(c => c.MinimumThresholdUsd)
            .GreaterThan(0m).WithMessage("Minimum payout threshold must be greater than 0.");
    }
}

public class UpdatePayoutSettingsCommandHandler : IRequestHandler<UpdatePayoutSettingsCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdatePayoutSettingsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(UpdatePayoutSettingsCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context.SystemSettings
            .FirstOrDefaultAsync(s => s.Key == SettingKey.Payout_MinThresholdUsd, cancellationToken);

        if (setting == null)
        {
            setting = new SystemSetting { Key = SettingKey.Payout_MinThresholdUsd };
            _context.SystemSettings.Add(setting);
        }

        setting.Value = request.MinimumThresholdUsd.ToString(CultureInfo.InvariantCulture);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(
            new PayoutSettingsDto { MinimumThresholdUsd = request.MinimumThresholdUsd },
            "Payout settings updated successfully.");
    }
}
