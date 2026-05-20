using Edunary.Application.Common.Models;
using Edunary.Application.Users;
using Edunary.Application.Users.Queries.GetAdminUserStatusCountsQuery;
using Edunary.Application.Users.Queries.GetAdminOverviewSummaryQuery;
using Edunary.Application.Users.Queries.GetRegistrationTrendQuery;
using Edunary.Application.Users.Queries.GetNewVsReturningQuery;
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

    Task<Result> UpdatePayoutAccountAsync(string userId, string bank, string bankNumber, string bankAccountHolder);

    Task<Result> UpdateUserAvatarAsync(string avatarUrl, string userId);

    Task<Result> Register(string userName, string phoneNumber, string email, string password, string fullName, string avatar = null);

    Task<Result> StartRegistration(string phoneNumber, string email, string password, string fullName);

    Task<Result> VerifyRegistration(string token);

    Task<Result> ResendRegistrationVerification(string email);

    Task<Result> ForgotPassword(string email);

    Task<Result> ResetPassword(string email, string token, string newPassword);

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

    Task<List<UserIdentityDto>> GetUserIdentitiesByIdsAsync(List<string> ids, CancellationToken cancellationToken);

    Task<List<string>> SearchUserIdsByNameOrEmailAsync(
        string nameKeyword,
        string emailKeyword,
        CancellationToken cancellationToken);

    Task<List<string>> SearchUserIdsByKeywordAsync(
        string keyword,
        CancellationToken cancellationToken);

    Task<Result> AddUserAsync(string email, string fullName, string password);

    Task<Result> RestrictUserAsync(string userId, string currentAdminId, int? durationDays);

    Task<Result> UnbanUserAsync(string userId);

    Task<Result> ChangeUserRoleAsync(string userId, string newRole, string currentAdminId);


    /// <summary>
    /// Returns status-based counts + trend percentages for the overview stat cards.
    /// Executes 2 lightweight aggregate queries on AspNetUsers.
    /// </summary>
    Task<OverviewStatsResult> GetOverviewStatsAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Returns per-day or per-month registration counts for the Area chart.
    /// Range: "7d" | "30d" | "3m" | "12m"
    /// </summary>
    Task<RegistrationTrendDto> GetRegistrationTrendAsync(string range, CancellationToken cancellationToken);

    /// <summary>
    /// Returns new users per month for a given year.
    /// ReturningUsers is always 0 until LoginHistory table is added.
    /// </summary>
    Task<NewVsReturningDto> GetNewVsReturningAsync(int year, CancellationToken cancellationToken);
}
