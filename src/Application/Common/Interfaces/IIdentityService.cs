using Edunary.Application.Common.Models;
using Edunary.Application.Users;
using Edunary.Application.Users.Queries.GetAdminUserStatusCountsQuery;
using Edunary.Domain.Common;
using Edunary.Domain.Enums;

namespace Edunary.Application.Common.Interfaces;
public interface IIdentityService
{
    Task<string> GetUserNameAsync(string userId);

    Task<string> GetFullNameAsync(string userId);

    Task<bool> IsInRoleAsync(string userId, string role);

    Task<bool> AuthorizeAsync(string userId, string policyName);

    Task<(Result Result, string UserId)> CreateUserAsync(string userName, string password);

    Task<Result> DeleteUserAsync(string userId);

    Task<Result> UpdateUserAsync(UserModel model);

    Task<Result> UpdateUserAvatarAsync(string avatarUrl, string userId);

    Task<Result> Register(string userName, string phoneNumber, string email, string password, string fullName, string avatar = null);
    
    Task<bool> CheckUserNameExist(string userName);
    
    Task<UserModel> GetUserById(string userId);

    Task<Result> Login(string userName, string passWord, AccountType accountType, bool? forceFirstLogin = null, string defaultPassword = null);

    Task<Result> RefreshToken();

    ValidateTokenModel ValidateToken(string token, TokenType tokenType);

    Task<Result> GetInforSocialUser(string accessToken, string provider);

    Task<bool> CheckPassword(string userId, string password);

    Task<Result> ChangePassword(string userId, string newPassword);
    Task<string> GetUserAvatarAsync(string userId);

    Task<AdminUserStatusCountsDto> GetUserStatusCountsAsync();

    Task<(IReadOnlyList<UserIdentityDto> Users, int TotalCount)> GetFilteredUsersAsync(
        string searchText, string roleFilter, string statusFilter,
        string sortBy, int pageNumber, int pageSize);

    Task<UserIdentityDto> GetUserIdentityByIdAsync(string userId);

    Task<Result> AddUserAsync(string email, string fullName, string password);

    Task<Result> RestrictUserAsync(string userId, string currentAdminId, int? durationDays);

    Task<Result> UnbanUserAsync(string userId);

    Task<Result> ChangeUserRoleAsync(string userId, string newRole, string currentAdminId);
}
