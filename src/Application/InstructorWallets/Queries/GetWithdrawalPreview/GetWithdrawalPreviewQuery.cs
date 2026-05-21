#nullable enable
using Edunary.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.InstructorWallets.Queries.GetWithdrawalPreview;

public class WithdrawalPreviewDto
{
    public decimal GrossAmount { get; set; }
    public decimal WithholdingRate { get; set; }
    public decimal WithholdingAmount { get; set; }
    public decimal NetAmount { get; set; }
    public string? TaxCountryCode { get; set; }
    public string Currency { get; set; } = "USD";
}

public class GetWithdrawalPreviewQuery : IRequest<WithdrawalPreviewDto>
{
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";
}

public class GetWithdrawalPreviewQueryHandler : IRequestHandler<GetWithdrawalPreviewQuery, WithdrawalPreviewDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ITaxCalculatorService _taxCalculatorService;

    public GetWithdrawalPreviewQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ITaxCalculatorService taxCalculatorService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _taxCalculatorService = taxCalculatorService;
    }

    public async Task<WithdrawalPreviewDto> Handle(GetWithdrawalPreviewQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId) || request.Amount <= 0m)
        {
            return new WithdrawalPreviewDto
            {
                GrossAmount = Math.Max(0m, request.Amount),
                Currency = request.Currency
            };
        }

        var profile = await _context.TaxProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.InstructorId == userId, cancellationToken);

        var withholdingResult = await _taxCalculatorService
            .CalculateWithholdingAsync(userId, request.Amount, cancellationToken);

        var withholdingAmount = Math.Round(withholdingResult.TaxAmount, 2, MidpointRounding.ToEven);
        var netAmount = Math.Round(Math.Max(0m, request.Amount - withholdingAmount), 2, MidpointRounding.ToEven);

        return new WithdrawalPreviewDto
        {
            GrossAmount = request.Amount,
            WithholdingRate = withholdingResult.Rate,
            WithholdingAmount = withholdingAmount,
            NetAmount = netAmount,
            TaxCountryCode = profile?.TaxCountryCode,
            Currency = string.IsNullOrWhiteSpace(request.Currency) ? "USD" : request.Currency
        };
    }
}
