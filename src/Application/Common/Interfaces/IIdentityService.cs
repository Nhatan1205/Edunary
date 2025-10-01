using Edunary.Application.Common.Models;
using Edunary.Domain.Common;

namespace Edunary.Application.Common.Interfaces;
public interface IIdentityService
{
    Task<string> GetUserNameAsync(string userId);

    Task<bool> IsInRoleAsync(string userId, string role);

    Task<bool> AuthorizeAsync(string userId, string policyName);

    Task<(Result Result, string UserId)> CreateUserAsync(string userName, string password);

    Task<Result> DeleteUserAsync(string userId);
    
    Task<Result> Register(string userName, string phoneNumber, string email, string password, string fullName);
    
    Task<bool> CheckUserNameExist(string userName);
    
    Task<UserModel> GetUserById(string userId);
    
    Task<Result> Login(string userName, string passWord);

    Task<Result> RefreshToken();
}
