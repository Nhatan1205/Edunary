using Edunary.Domain.Enums;

namespace Edunary.Application.CourseCollaborators.Queries.GetMyInvitationsQuery;

public class InvitationDto
{
    public int CollaboratorId { get; set; }
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;

    #nullable enable
    public string? CourseImageUrl { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerAvatarUrl { get; set; }
    #nullable disable

    public CoursePermission Permissions { get; set; }
    public bool IsVisible { get; set; }
    public decimal RevenueSharePercent { get; set; }
    public DateTimeOffset InvitedAt { get; set; }
}
