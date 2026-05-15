using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Users.Queries.GetBasicUserInfoQuery;
public class GetBasicUserInfoQuery : IRequest<UserVm>, ICacheableQuery
{
    public string Id { get; set; }
    public string UserId { get; init; }

    public string CacheKey => $"users:basic:{UserId}";
    public TimeSpan CacheDuration => TimeSpan.FromHours(24);
}
public class GetBasicUserInfoQueryHandler : IRequestHandler<GetBasicUserInfoQuery, UserVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public GetBasicUserInfoQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<UserVm> Handle(GetBasicUserInfoQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var user = await _identityService.GetUserById(userId);
        if (user == null)
        {
            return null;
        }
        var UserLink = string.IsNullOrEmpty(user.Links) ? null : JsonSerializer.Deserialize<UserLinksDto>(user.Links);
        if (user != null)
        {
            return new UserVm
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Avatar = user.Avatar,
                Bank = user.Bank,
                BankNumber = user.BankNumber,
                BankAccountHolder = user.BankAccountHolder,
                Headline = user.Headline,
                Description = user.Description,
                Links = UserLink
            };
        }
        else
        {
            return null;
        }
    }
}
