using Edunary.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Edunary.Infrastructure.Identity;
public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; }
    public string Avatar { get; set; }
    public string Headline { get; set; }
    public string Description { get; set; }
    public string Links { get; set; }
    public virtual DateTime? LastLoginTime {  get; set; }

}
