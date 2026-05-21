using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Finance.TaxRegions.Commands;

public record DeleteTaxRegionCommand(string CountryCode) : IRequest<Result>;

public class DeleteTaxRegionCommandHandler : IRequestHandler<DeleteTaxRegionCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteTaxRegionCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteTaxRegionCommand request, CancellationToken cancellationToken)
    {
        var region = await _context.TaxRegions
            .FirstOrDefaultAsync(r => r.CountryCode == request.CountryCode, cancellationToken);

        if (region == null)
            return Result.Failure([$"Tax region '{request.CountryCode}' not found."]);

        _context.TaxRegions.Remove(region);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
