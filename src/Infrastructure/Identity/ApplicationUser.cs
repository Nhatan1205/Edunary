using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace Edunary.Infrastructure.Identity;
public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; }
    public string Avatar { get; set; }
    public string Headline { get; set; }
    public string Description { get; set; }
    public string Links { get; set; }
    public string Bank { get; set; }
    public string BankNumber { get; set; }
    public string BankAccountHolder { get; set; }

    public virtual DateTime? LastLoginTime { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public UserStatus Status { get; set; } = UserStatus.Active;
}
