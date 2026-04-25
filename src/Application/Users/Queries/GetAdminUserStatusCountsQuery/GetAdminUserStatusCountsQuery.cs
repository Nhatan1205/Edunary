using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Users.Queries.GetAdminUserStatusCountsQuery;

public record GetAdminUserStatusCountsQuery : IRequest<AdminUserStatusCountsDto>;

public class GetAdminUserStatusCountsQueryHandler
    : IRequestHandler<GetAdminUserStatusCountsQuery, AdminUserStatusCountsDto>
{
    private readonly IIdentityService _identityService;

    public GetAdminUserStatusCountsQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<AdminUserStatusCountsDto> Handle(
        GetAdminUserStatusCountsQuery request, CancellationToken cancellationToken)
    {
        return await _identityService.GetUserStatusCountsAsync();
    }
}
