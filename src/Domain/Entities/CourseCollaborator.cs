namespace Edunary.Domain.Entities;

public class CourseCollaborator : BaseAuditableEntity
{
    public int CourseId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public CoursePermission Permissions { get; set; }
    public bool IsVisible { get; set; }
    public decimal RevenueSharePercent { get; set; }
    public CollaboratorInviteStatus InviteStatus { get; set; } = CollaboratorInviteStatus.Pending;

    // Navigation
    public Course Course { get; set; } = null!;
}
