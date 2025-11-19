using Edunary.Application.Common.Models;
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
    
    Task<Result> Register(string userName, string phoneNumber, string email, string password, string fullName, string avatar = null);
    
    Task<bool> CheckUserNameExist(string userName);
    
    Task<UserModel> GetUserById(string userId);
    
    Task<Result> Login(string userName, string passWord, AccountType accountType, bool? forceFirstLogin = null, string defaultPassword = null);

    Task<Result> RefreshToken();

    ValidateTokenModel ValidateToken(string token, TokenType tokenType);

    Task<Result> GetInforSocialUser(string accessToken, string provider);

    Task<bool> CheckPassword(string userId, string password);

    Task<Result> ChangePassword(string userId, string newPassword);
}
