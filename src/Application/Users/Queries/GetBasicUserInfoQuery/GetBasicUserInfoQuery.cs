using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Users.Queries.GetBasicUserInfoQuery;
public class GetBasicUserInfoQuery : IRequest<UserVm>
{
    public string Id { get; set; }
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
