using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;

namespace Edunary.Application.InstructorWallets.Queries.GetWithdrawalRequestsForAdmin;

[Authorize(Roles = Roles.Administrator)]
public class GetWithdrawalRequestsForAdminQuery : IRequest<PaginatedList<AdminWithdrawalRequestDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;

    public InstructorWalletTransactionStatus? Status { get; init; }
    public DateTimeOffset? FromDate { get; init; }
    public DateTimeOffset? ToDate { get; init; }
}

public class GetWithdrawalRequestsForAdminQueryHandler
    : IRequestHandler<GetWithdrawalRequestsForAdminQuery, PaginatedList<AdminWithdrawalRequestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetWithdrawalRequestsForAdminQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<PaginatedList<AdminWithdrawalRequestDto>> Handle(
        GetWithdrawalRequestsForAdminQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.WithdrawalRequests
            .AsNoTracking()
            .Select(w => new AdminWithdrawalRequestDto
            {
                Id = w.Id,
                Created = w.Created,
                InstructorId = w.InstructorWallet.InstructorId,
                Amount = w.Amount,
                Currency = w.Currency,
                Bank = w.Bank,
                BankNumber = w.BankNumber,
                BankAccountHolder = w.BankAccountHolder,
                Status = w.Status
            });

        if (request.Status.HasValue)
        {
            query = query.Where(w => w.Status == request.Status.Value);
        }

        if (request.FromDate.HasValue)
        {
            var fromDayUtc = request.FromDate.Value.UtcDateTime.Date;
            var from = new DateTimeOffset(fromDayUtc, TimeSpan.Zero);
            query = query.Where(w => w.Created >= from);
        }

        if (request.ToDate.HasValue)
        {
            var toExclusiveDayUtc = request.ToDate.Value.UtcDateTime.Date.AddDays(1);
            var toExclusive = new DateTimeOffset(toExclusiveDayUtc, TimeSpan.Zero);
            query = query.Where(w => w.Created < toExclusive);
        }

        query = query.OrderByDescending(w => w.Created);

        var paginated = await query.PaginatedListAsync(request.PageNumber, request.PageSize);

        var instructorIds = paginated.Items
            .Select(w => w.InstructorId)
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Distinct()
            .ToList();

        if (instructorIds.Count == 0)
        {
            return paginated;
        }

        var instructorNames = new Dictionary<string, string>();
        foreach (var instructorId in instructorIds)
        {
            var fullName = await _identityService.GetFullNameAsync(instructorId);
            instructorNames[instructorId] = string.IsNullOrWhiteSpace(fullName) ? instructorId : fullName;
        }

        foreach (var item in paginated.Items)
        {
            if (instructorNames.TryGetValue(item.InstructorId, out var instructorName))
            {
                item.InstructorName = instructorName;
            }
        }

        return paginated;
    }
}
