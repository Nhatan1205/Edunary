using Edunary.Application.Common.Interfaces;
using Edunary.Application.TaxProfiles.Models;
using Edunary.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.TaxProfiles.Queries.GetMyTaxProfile;

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
            return new TaxProfileDto
            {
                TaxCountryCode = profile.TaxCountryCode ?? string.Empty,
                HasSubmittedW8Ben = profile.HasSubmittedW8Ben,
                W8BenSubmittedAt = profile.W8BenSubmittedAt ?? default,
                WithholdingRate = profile.WithholdingRate,
                LastReviewedAt = profile.LastReviewedAt ?? default
            };
        }

        var defaultRate = 0.30m;
        var setting = await _context.SystemSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Key == SettingKey.Tax_DefaultWithholdingRate, cancellationToken);

        if (setting?.Value != null && decimal.TryParse(setting.Value, out var parsed))
        {
            defaultRate = parsed;
        }

        return new TaxProfileDto
        {
            WithholdingRate = defaultRate
        };
    }
}
