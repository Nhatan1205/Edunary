using Edunary.Domain.Enums;

namespace Edunary.Application.Common.Models;
public class UserIdentityDto
{
    public string Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Avatar { get; set; }
    public string Headline { get; set; }
    public string Description { get; set; }
    public string Links { get; set; }
    public string PhoneNumber { get; set; }
    public List<string> Roles { get; set; } = new();
    public UserStatus Status { get; set; }

    public DateTimeOffset? LockoutEnd { get; set; }

    public DateTime? LastLoginTime { get; set; }
    public DateTime CreatedAt { get; set; }
}
