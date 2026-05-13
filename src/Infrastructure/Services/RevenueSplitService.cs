using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Services;

public class RevenueSplitService : IRevenueSplitService
{
    private readonly IApplicationDbContext _context;

    public RevenueSplitService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RevenueSplit> SplitAsync(decimal grossAmount, SalesChannel channel, DateTimeOffset asOf, CancellationToken ct)
    {
        var plan = await _context.RevenueSharePlans
            .Where(p => p.Channel == channel && p.IsActive && p.EffectiveFrom <= asOf && (p.EffectiveTo == null || p.EffectiveTo >= asOf))
            .OrderByDescending(p => p.EffectiveFrom)
            .FirstOrDefaultAsync(ct);

        var instructorPct = plan?.InstructorPercentage ?? 1.0m;
        var instructorShare = Math.Round(grossAmount * instructorPct, 4, MidpointRounding.ToEven);
        var platformShare = grossAmount - instructorShare;
        return new RevenueSplit(instructorShare, platformShare);
    }
}
