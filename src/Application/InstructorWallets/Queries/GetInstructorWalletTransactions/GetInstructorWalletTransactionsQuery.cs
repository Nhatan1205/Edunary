#nullable enable
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.InstructorWallets.Queries.GetInstructorWalletTransactions;

public class GetInstructorWalletTransactionsQuery : IRequest<PaginatedList<InstructorWalletTransactionDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;

    // Filters
    // Type: "purchase" | "withdrawal" (null/empty => all)
    public string? Type { get; init; }
    // FromDate/ToDate are treated as day-based filters (UTC).
    public DateTimeOffset? FromDate { get; init; }
    public DateTimeOffset? ToDate { get; init; }
    public int? OrderId { get; init; }
    public int? CourseId { get; init; }

    // Sorting
    // AmountSort: "asc" | "desc" (null/empty => default by Created desc)
    public string? AmountSort { get; init; }
}

public class GetInstructorWalletTransactionsQueryHandler
    : IRequestHandler<GetInstructorWalletTransactionsQuery, PaginatedList<InstructorWalletTransactionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetInstructorWalletTransactionsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedList<InstructorWalletTransactionDto>> Handle(GetInstructorWalletTransactionsQuery request, CancellationToken cancellationToken)
    {
        var instructorId = _currentUserService.UserId;

        if (string.IsNullOrWhiteSpace(instructorId))
        {
            return new PaginatedList<InstructorWalletTransactionDto>(
                Array.Empty<InstructorWalletTransactionDto>(),
                0,
                request.PageNumber,
                request.PageSize);
        }

        var purchaseQuery = _context.InstructorWalletTransactions
            .AsNoTracking()
            .Where(t => t.InstructorWallet.InstructorId == instructorId)
            .Select(t => new InstructorWalletTransactionDto
            {
                Id = t.Id,
                Created = t.Created,
                OrderId = t.OrderId,
                CourseId = t.CourseId,
                Amount = t.Amount,
                Currency = t.Currency,
                Status = InstructorWalletTransactionStatus.Succeeded
            });

        var withdrawalQuery = _context.WithdrawalRequests
            .AsNoTracking()
            .Where(t => t.InstructorWallet.InstructorId == instructorId)
            .Select(t => new InstructorWalletTransactionDto
            {
                Id = t.Id,
                Created = t.Created,
                OrderId = 0,
                CourseId = 0,
                Amount = t.Amount,
                Currency = t.Currency,
                Status = t.Status
            });

        var type = request.Type?.Trim().ToLowerInvariant();

        if (request.FromDate.HasValue)
        {
            var fromDayUtc = request.FromDate.Value.UtcDateTime.Date;
            var from = new DateTimeOffset(fromDayUtc, TimeSpan.Zero);
            purchaseQuery = purchaseQuery.Where(t => t.Created >= from);
            withdrawalQuery = withdrawalQuery.Where(t => t.Created >= from);
        }

        if (request.ToDate.HasValue)
        {
            var toExclusiveDayUtc = request.ToDate.Value.UtcDateTime.Date.AddDays(1);
            var toExclusive = new DateTimeOffset(toExclusiveDayUtc, TimeSpan.Zero);
            purchaseQuery = purchaseQuery.Where(t => t.Created < toExclusive);
            withdrawalQuery = withdrawalQuery.Where(t => t.Created < toExclusive);
        }

        if (request.OrderId.HasValue)
        {
            purchaseQuery = purchaseQuery.Where(t => t.OrderId == request.OrderId.Value);
        }

        if (request.CourseId.HasValue)
        {
            purchaseQuery = purchaseQuery.Where(t => t.CourseId == request.CourseId.Value);
        }

        var query = type switch
        {
            "purchase" => purchaseQuery,
            "withdrawal" => withdrawalQuery,
            _ => purchaseQuery.Concat(withdrawalQuery)
        };

        var amountSort = request.AmountSort?.Trim().ToLowerInvariant();
        query = amountSort switch
        {
            "asc" => query.OrderBy(t => t.Amount).ThenByDescending(t => t.Created),
            "desc" => query.OrderByDescending(t => t.Amount).ThenByDescending(t => t.Created),
            _ => query.OrderByDescending(t => t.Created)
        };

        return await query.PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}
