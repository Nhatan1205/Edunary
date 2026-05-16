using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;
using Edunary.Domain.Entities;
using FluentValidation;

namespace Edunary.Application.Finance.TaxRegions.Commands;

[Authorize(Roles = Roles.Administrator)]
public record UpsertTaxRegionCommand : IRequest<Result>
{
    public string CountryCode { get; init; } = string.Empty;
    public string CountryName { get; init; } = string.Empty;
    public decimal VatRate { get; init; }
    public decimal WithholdingRate { get; init; }
    public bool IsActive { get; init; } = true;
}

public class UpsertTaxRegionCommandValidator : AbstractValidator<UpsertTaxRegionCommand>
{
    public UpsertTaxRegionCommandValidator()
    {
        RuleFor(x => x.CountryCode)
            .NotEmpty()
            .Length(2)
            .Matches("^[A-Z]{2}$").WithMessage("Country code must be exactly 2 uppercase letters (e.g. VN, US).");

        RuleFor(x => x.CountryName)
            .NotEmpty().WithMessage("Country name is required.")
            .MaximumLength(100);

        RuleFor(x => x.VatRate)
            .InclusiveBetween(0m, 1m).WithMessage("VAT rate must be between 0 and 1 (e.g. 0.10 for 10%).");

        RuleFor(x => x.WithholdingRate)
            .InclusiveBetween(0m, 1m).WithMessage("Withholding rate must be between 0 and 1 (e.g. 0.30 for 30%).");
    }
}

public class UpsertTaxRegionCommandHandler : IRequestHandler<UpsertTaxRegionCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpsertTaxRegionCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpsertTaxRegionCommand request, CancellationToken cancellationToken)
    {
        var countryCode = request.CountryCode.ToUpperInvariant();
        var existing = await _context.TaxRegions.FindAsync([countryCode], cancellationToken);

        if (existing == null)
        {
            _context.TaxRegions.Add(new TaxRegion
            {
                CountryCode = countryCode,
                CountryName = request.CountryName.Trim(),
                VatRate = request.VatRate,
                WithholdingRate = request.WithholdingRate,
                IsActive = request.IsActive
            });
        }
        else
        {
            existing.CountryName = request.CountryName.Trim();
            existing.VatRate = request.VatRate;
            existing.WithholdingRate = request.WithholdingRate;
            existing.IsActive = request.IsActive;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
