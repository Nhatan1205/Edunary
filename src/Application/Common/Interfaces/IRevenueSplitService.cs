using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Common.Interfaces;

public interface IRevenueSplitService
{
    Task<RevenueSplit> SplitAsync(decimal grossAmount, SalesChannel channel, DateTimeOffset asOf, CancellationToken ct);
}
