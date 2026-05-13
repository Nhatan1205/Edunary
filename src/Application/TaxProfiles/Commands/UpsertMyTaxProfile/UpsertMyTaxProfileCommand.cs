using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Constants;
using Edunary.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.TaxProfiles.Commands.UpsertMyTaxProfile;

public class UpsertMyTaxProfileCommand : IRequest<Result>
{
    public string TaxCountryCode { get; init; } = string.Empty;
    public bool HasSubmittedW8Ben { get; init; }
}

public class UpsertMyTaxProfileCommandHandler : IRequestHandler<UpsertMyTaxProfileCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpsertMyTaxProfileCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpsertMyTaxProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result.Failure("User not authenticated");
        }

        var countryCode = (request.TaxCountryCode ?? string.Empty).Trim().ToUpperInvariant();
        if (countryCode.Length > 0 && countryCode.Length != 2)
        {
            return Result.Failure("Tax country code must be exactly 2 letters");
        }

        var profile = await _context.TaxProfiles
            .FirstOrDefaultAsync(p => p.InstructorId == userId, cancellationToken);

        if (profile == null)
        {
            var defaultRate = 0.30m;
            var setting = await _context.SystemSettings
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Key == SettingKey.Tax_DefaultWithholdingRate, cancellationToken);

            if (setting?.Value != null && decimal.TryParse(setting.Value, out var parsed))
            {
                defaultRate = parsed;
            }

            profile = new TaxProfile
            {
                InstructorId = userId,
                WithholdingRate = defaultRate
            };

            _context.TaxProfiles.Add(profile);
        }

        profile.TaxCountryCode = countryCode;

        if (request.HasSubmittedW8Ben && !profile.HasSubmittedW8Ben)
        {
            profile.W8BenSubmittedAt = DateTimeOffset.UtcNow;
        }
        else if (!request.HasSubmittedW8Ben)
        {
            profile.W8BenSubmittedAt = null;
        }

        profile.HasSubmittedW8Ben = request.HasSubmittedW8Ben;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new
        {
            profile.TaxCountryCode,
            profile.HasSubmittedW8Ben,
            profile.W8BenSubmittedAt,
            profile.WithholdingRate,
            profile.LastReviewedAt
        }, "Tax profile updated");
    }
}
