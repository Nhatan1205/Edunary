using Edunary.Domain.Enums;

namespace Edunary.Application.CourseCollaborators.Queries.GetCollaboratorsQuery;

public class CollaboratorDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    #nullable enable
    public string? AvatarUrl { get; set; }
    #nullable disable

    public CoursePermission Permissions { get; set; }
    public bool IsVisible { get; set; }
    public decimal RevenueSharePercent { get; set; }
    public CollaboratorInviteStatus InviteStatus { get; set; }
    public bool IsOwner { get; set; }
}
