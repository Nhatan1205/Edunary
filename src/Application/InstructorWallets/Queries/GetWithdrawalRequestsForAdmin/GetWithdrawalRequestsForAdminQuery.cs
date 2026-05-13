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

    public string InstructorName { get; init; }
    public string InstructorEmail { get; init; }
    public string BankNumber { get; init; }
    public string BankAccountHolder { get; init; }
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
                WithholdingAmount = w.WithholdingAmount,
                NetAmount = w.NetAmount,
                WithholdingRate = w.WithholdingRate,
                TaxCountryCode = w.TaxCountryCode,
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

        if (!string.IsNullOrWhiteSpace(request.BankNumber))
        {
            var bn = request.BankNumber.Trim().ToLower();
            query = query.Where(w => w.BankNumber != null && w.BankNumber.ToLower().Contains(bn));
        }

        if (!string.IsNullOrWhiteSpace(request.BankAccountHolder))
        {
            var bh = request.BankAccountHolder.Trim().ToLower();
            query = query.Where(w => w.BankAccountHolder != null && w.BankAccountHolder.ToLower().Contains(bh));
        }

        if (!string.IsNullOrWhiteSpace(request.InstructorName) ||
            !string.IsNullOrWhiteSpace(request.InstructorEmail))
        {
            var matchingIds = await _identityService.SearchUserIdsByNameOrEmailAsync(
                request.InstructorName,
                request.InstructorEmail,
                cancellationToken);

            if (matchingIds.Count == 0)
            {
                return new PaginatedList<AdminWithdrawalRequestDto>(
                    Array.Empty<AdminWithdrawalRequestDto>(),
                    0,
                    request.PageNumber,
                    request.PageSize);
            }

            query = query.Where(w => matchingIds.Contains(w.InstructorId));
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

        var instructors = await _identityService.GetUserIdentitiesByIdsAsync(instructorIds, cancellationToken);
        var instructorMap = instructors
            .Where(u => !string.IsNullOrWhiteSpace(u.Id))
            .ToDictionary(u => u.Id, u => u);

        foreach (var item in paginated.Items)
        {
            if (instructorMap.TryGetValue(item.InstructorId, out var instructor))
            {
                item.InstructorName = string.IsNullOrWhiteSpace(instructor.FullName)
                    ? item.InstructorId
                    : instructor.FullName;
                item.InstructorEmail = instructor.Email ?? string.Empty;
            }
            else
            {
                item.InstructorName = item.InstructorId;
                item.InstructorEmail = string.Empty;
            }
        }

        return paginated;
    }
}
