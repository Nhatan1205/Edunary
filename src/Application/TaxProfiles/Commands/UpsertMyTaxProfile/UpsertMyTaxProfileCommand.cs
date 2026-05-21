using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.TaxProfiles.Commands.UpsertMyTaxProfile;

public class UpsertMyTaxProfileCommand : IRequest<Result>
{
    public string RealName { get; init; } = string.Empty;
    public string TaxIdentificationNumber { get; init; } = string.Empty;
    public string TaxCountryCode { get; init; } = string.Empty;
}

public class UpsertMyTaxProfileCommandValidator : AbstractValidator<UpsertMyTaxProfileCommand>
{
    public UpsertMyTaxProfileCommandValidator()
    {
        RuleFor(x => x.RealName)
            .NotEmpty().WithMessage("Real name is required.")
            .MaximumLength(200);

        RuleFor(x => x.TaxIdentificationNumber)
            .NotEmpty().WithMessage("Tax Identification Number is required.")
            .MaximumLength(64);

        RuleFor(x => x.TaxCountryCode)
            .NotEmpty().WithMessage("Country is required.")
            .Length(2)
            .Matches("^[A-Za-z]{2}$").WithMessage("Tax country code must be exactly 2 letters.");
    }
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

        var realName = (request.RealName ?? string.Empty).Trim();
        var taxIdentificationNumber = (request.TaxIdentificationNumber ?? string.Empty).Trim();
        var countryCode = (request.TaxCountryCode ?? string.Empty).Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(realName))
        {
            return Result.Failure("Real name is required");
        }

        if (realName.Length > 200)
        {
            return Result.Failure("Real name must be 200 characters or fewer");
        }

        if (string.IsNullOrWhiteSpace(taxIdentificationNumber))
        {
            return Result.Failure("Tax Identification Number is required");
        }

        if (taxIdentificationNumber.Length > 64)
        {
            return Result.Failure("Tax Identification Number must be 64 characters or fewer");
        }

        if (countryCode.Length != 2)
        {
            return Result.Failure("Tax country code must be exactly 2 letters");
        }

        var region = await _context.TaxRegions
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.CountryCode == countryCode && r.IsActive, cancellationToken);

        if (region == null)
        {
            return Result.Failure("Selected tax country is not configured");
        }

        var profile = await _context.TaxProfiles
            .FirstOrDefaultAsync(p => p.InstructorId == userId, cancellationToken);

        if (profile == null)
        {
            profile = new TaxProfile
            {
                InstructorId = userId
            };

            _context.TaxProfiles.Add(profile);
        }

        profile.RealName = realName;
        profile.TaxIdentificationNumber = taxIdentificationNumber;
        profile.TaxCountryCode = countryCode;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new
        {
            profile.RealName,
            profile.TaxIdentificationNumber,
            profile.TaxCountryCode,
            CountryName = region.CountryName,
            WithholdingRate = region.WithholdingRate
        }, "Tax profile updated");
    }
}
