namespace Edunary.Application.Users.Queries.GetAdminUsersWithPaginationQuery;

public class AdminUserListItemDto
{
    public string Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Avatar { get; set; }
    public List<string> Roles { get; set; } = new();
    public string Status { get; set; }
    public DateTime? LastLoginTime { get; set; }
    public DateTime? CreatedAt { get; set; }
    public int EnrolledCourseCount { get; set; }
    public int CreatedCourseCount { get; set; }
    public bool IsOnline { get; set; }
}
