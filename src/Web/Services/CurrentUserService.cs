using System.ComponentModel.Design;
using System.Security.Claims;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Common;
using Microsoft.Extensions.Options;

namespace Edunary.Web.Services;

public class CurrentUserService : ICurrentUserService
{
    public CurrentUserService(IHttpContextAccessor httpContextAccessor, IOptions<AppSettings> appSettings)
    {
        UserId = httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        UserName = httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name);
        Email = httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);
        FullName = httpContextAccessor.HttpContext?.User?.FindFirstValue("fullName");
        Avatar = httpContextAccessor.HttpContext?.User?.FindFirstValue("picture");
        Token = httpContextAccessor.HttpContext?.Request?.Headers["Authorization"];
    }
    public string UserId { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public string Avatar { get; set; }

    public string Token { get; }
}
