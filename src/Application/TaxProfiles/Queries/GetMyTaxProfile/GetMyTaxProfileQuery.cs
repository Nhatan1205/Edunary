using Edunary.Application.Common.Interfaces;
using Edunary.Application.TaxProfiles.Models;
using Edunary.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

using Edunary.Application.Common.Behaviours;
using Edunary.Domain.Enums;

namespace Edunary.Application.TaxProfiles.Queries.GetMyTaxProfile;

[ActivityLog(ActivityType.AccessTaxProfile, "Access Tax Profile")]
public record GetMyTaxProfileQuery : IRequest<TaxProfileDto>;

public class GetMyTaxProfileQueryHandler : IRequestHandler<GetMyTaxProfileQuery, TaxProfileDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetMyTaxProfileQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<TaxProfileDto> Handle(GetMyTaxProfileQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return new TaxProfileDto();
        }

        var profile = await _context.TaxProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.InstructorId == userId, cancellationToken);

        if (profile != null)
        {
            var defaultRate = await GetDefaultWithholdingRate(cancellationToken);
            var countryCode = profile.TaxCountryCode ?? string.Empty;
            var region = string.IsNullOrWhiteSpace(countryCode)
                ? null
                : await _context.TaxRegions
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r => r.CountryCode == countryCode && r.IsActive, cancellationToken);

            return new TaxProfileDto
            {
                RealName = string.IsNullOrWhiteSpace(profile.RealName)
                    ? _currentUserService.FullName ?? string.Empty
                    : profile.RealName,
                TaxIdentificationNumber = profile.TaxIdentificationNumber ?? string.Empty,
                TaxCountryCode = countryCode,
                CountryName = region?.CountryName ?? string.Empty,
                WithholdingRate = region?.WithholdingRate ?? defaultRate
            };
        }

        return new TaxProfileDto
        {
            RealName = _currentUserService.FullName ?? string.Empty,
            WithholdingRate = await GetDefaultWithholdingRate(cancellationToken)
        };
    }

    private async Task<decimal> GetDefaultWithholdingRate(CancellationToken cancellationToken)
    {
        var defaultRate = 0.30m;
        var setting = await _context.SystemSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Key == SettingKey.Tax_DefaultWithholdingRate, cancellationToken);

        if (setting?.Value != null && decimal.TryParse(setting.Value, out var parsed))
        {
            defaultRate = parsed;
        }

        return defaultRate;
    }
}
