namespace Edunary.Application.Users.Queries.GetAdminUserStatusCountsQuery;

/// <summary>
/// Số lượng users theo từng trạng thái — dùng để hiển thị badge trên Status Tabs.
/// Không bị ảnh hưởng bởi search hay filter — chỉ thay đổi khi thêm/xóa user hoặc đổi status.
/// </summary>
public class AdminUserStatusCountsDto
{
    public int Total { get; set; }
    public int Active { get; set; }
    public int Inactive { get; set; }
    public int Suspended { get; set; }
    public int Banned { get; set; }
}
