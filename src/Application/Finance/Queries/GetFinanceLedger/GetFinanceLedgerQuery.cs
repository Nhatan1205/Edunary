using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Finance.Queries.GetFinanceLedger;

[Authorize(Roles = Roles.Administrator)]
public record GetFinanceLedgerQuery : IRequest<PaginatedList<FinanceLedgerEntryDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string AccountCode { get; init; }
    public string UserId { get; init; }
    public DateTimeOffset? From { get; init; }
    public DateTimeOffset? To { get; init; }
    public LedgerTransactionType? TransactionType { get; init; }
}

public class GetFinanceLedgerQueryHandler : IRequestHandler<GetFinanceLedgerQuery, PaginatedList<FinanceLedgerEntryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFinanceLedgerQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedList<FinanceLedgerEntryDto>> Handle(
        GetFinanceLedgerQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.FinancialEntries
            .AsNoTracking()
            .Join(_context.FinancialTransactions,
                e => e.TransactionId,
                t => t.Id,
                (e, t) => new { e, t })
            .Where(x => x.t.Status == LedgerTransactionStatus.Posted);

        if (!string.IsNullOrWhiteSpace(request.AccountCode))
            query = query.Where(x => x.e.AccountCode == request.AccountCode);

        if (!string.IsNullOrWhiteSpace(request.UserId))
            query = query.Where(x => x.e.UserId == request.UserId);

        if (request.From.HasValue)
            query = query.Where(x => x.t.OccurredAt >= request.From.Value);

        if (request.To.HasValue)
            query = query.Where(x => x.t.OccurredAt <= request.To.Value);

        if (request.TransactionType.HasValue)
            query = query.Where(x => x.t.TransactionType == request.TransactionType.Value);

        return await query
            .OrderByDescending(x => x.t.OccurredAt)
            .ThenBy(x => x.e.EntryOrder)
            .Select(x => new FinanceLedgerEntryDto
            {
                Id = x.e.Id,
                TransactionId = x.e.TransactionId,
                TransactionType = x.t.TransactionType.ToString(),
                AccountCode = x.e.AccountCode,
                Side = x.e.Side.ToString(),
                Amount = x.e.Amount,
                UserId = x.e.UserId,
                Description = x.e.Description,
                OccurredAt = x.t.OccurredAt,
                ReferenceType = x.t.ReferenceType,
                ReferenceId = x.t.ReferenceId,
                Currency = x.t.Currency,
            })
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}
