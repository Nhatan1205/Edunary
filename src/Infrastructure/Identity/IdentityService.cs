using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Common;
using Edunary.Domain.Enums;
using Edunary.Domain.Helpers;
using Edunary.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Edunary.Infrastructure.Identity;
public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUserClaimsPrincipalFactory<ApplicationUser> _userClaimsPrincipalFactory;
    private readonly IAuthorizationService _authorizationService;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ILogger<IdentityService> _logger;
    private readonly ApplicationDbContext _context;
    private readonly AppSettings _appSettings;
    private readonly ICurrentUserService _currentUserService;

    public IdentityService(
        UserManager<ApplicationUser> userManager,
        IUserClaimsPrincipalFactory<ApplicationUser> userClaimsPrincipalFactory,
        IAuthorizationService authorizationService,
        RoleManager<ApplicationRole> roleManager,
        ILogger<IdentityService> logger,
        ApplicationDbContext context,
        IOptions<AppSettings> appSettings,
        ICurrentUserService currentUserService)
    {
        _userManager = userManager;
        _userClaimsPrincipalFactory = userClaimsPrincipalFactory;
        _authorizationService = authorizationService;
        _roleManager = roleManager;
        _logger = logger;
        _context = context;
        _appSettings = appSettings.Value;
        _currentUserService = currentUserService;
    }

    public async Task<string> GetUserNameAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        return user?.UserName;
    }

    public async Task<Result> Register(string userName, string phoneNumber, string email, string password, string fullName)
    {
        Result rs = Result.Failure();
        try
        {
            IdentityResult result;
            var user = new ApplicationUser
            {
                UserName = userName,
                PhoneNumber = phoneNumber,
                Email = email,
                FullName = fullName
            };
            if (!string.IsNullOrEmpty(password))
            {
                result = await _userManager.CreateAsync(user, password);
            }
            else
            {
                result = await _userManager.CreateAsync(user);
            }
            if (!result.Succeeded)
            {
                rs = Result.Failure(result.Errors.First().Description);
            }
            else
            {
                result = await _userManager.AddToRoleAsync(user, "User");
                if (!result.Succeeded)
                {
                    rs = Result.Failure(result.Errors.First().Description);
                }
                else
                {
                    rs = Result.Success();
                }
            }

        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at Register. Ex: {0}", ex.Message);
        }
        return rs;
    }
    public async Task<(Result Result, string UserId)> CreateUserAsync(string userName, string password)
    {
        var user = new ApplicationUser
        {
            UserName = userName,
            Email = userName,
        };

        var result = await _userManager.CreateAsync(user, password);

        return (result.ToApplicationResult(), user.Id);
    }

    public async Task<bool> IsInRoleAsync(string userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId);

        return user != null && await _userManager.IsInRoleAsync(user, role);
    }

    public async Task<bool> AuthorizeAsync(string userId, string policyName)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            return false;
        }

        var principal = await _userClaimsPrincipalFactory.CreateAsync(user);

        var result = await _authorizationService.AuthorizeAsync(principal, policyName);

        return result.Succeeded;
    }

    public async Task<Result> DeleteUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        return user != null ? await DeleteUserAsync(user) : Result.Success();
    }

    public async Task<Result> DeleteUserAsync(ApplicationUser user)
    {
        var result = await _userManager.DeleteAsync(user);

        return result.ToApplicationResult();
    }

    public async Task<bool> CheckUserNameExist(string userName)
    {
        bool exist = false;
        try
        {
            var user = await _userManager.FindByNameAsync(userName);
            if (user != null)
            {
                return true;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at CheckUserNameExist. Ex: {0}", ex.Message);
        }
        return exist;
    }

    public async Task<UserModel> GetUserById(string userId)
    {
        UserModel userModel = new UserModel();

        try
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null)
            {
                throw new InvalidOperationException("User not found.");
            }

            if (user != null)
            {
                var listRoleUser = new List<string>();
                var listRole = await _context.UserRoles.Where(x => x.UserId == user.Id).ToListAsync();
                if (listRole.Count > 0)
                {
                    foreach (var role in listRole)
                    {
                        listRoleUser.Add(role.RoleId);
                    }
                }


                userModel = new UserModel()
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Avatar = user.Avatar,
                    FullName = user.FullName,
                    Password = user.PasswordHash,
                    Roles = listRoleUser,
                };

                if (!user.LockoutEnabled && user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.Now)
                {
                    userModel.Disable = true;
                }
                else
                {
                    userModel.Disable = false;

                }

            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at GetUserById. Ex: {0}", ex.Message);
        }

        return userModel;
    }

    public async Task<Result> Login(string userName, string passWord)
    {
        Result rs = Result.Failure();
        try
        {
            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
            {
                rs = Result.Failure("Email/User Name or Password is incorrect");
            }
            else
            {
                bool isLogin = true;
                var validPassword = await _userManager.CheckPasswordAsync(user, passWord);
                if (!validPassword)
                {
                    rs = Result.Failure("Email/User Name or Password is incorrect");
                    isLogin = false;
                }
                if (isLogin)
                {
                    bool isFirstLogin = user.LastLoginTime == null;
                    user.LastLoginTime = DateTime.Now;
                    await _userManager.UpdateAsync(user);
                    string accessToken = await CreateToken(user, TokenType.AccessToken, false, isFirstLogin);
                    string refreshToken = await CreateToken(user, TokenType.RefreshToken);
                    await SetTokenAsync(user, "system", Utils.GetEnumMemberValue(TokenType.RefreshToken), refreshToken);
                    rs = Result.Success(accessToken);
                }
                
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at Login. Ex: {0}", ex.Message);
        }

        return rs;
    }
    
    public async Task<string> CreateToken(ApplicationUser user, TokenType tokenType, bool newAccount = false, bool isFirstLogin = false)
    {
        bool requiresPasswordChange = false;
        string token = string.Empty;
        byte[] key = null;
        int expiredTime = 60;
        List<string> perrmission = new List<string>();
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var roles = _userManager.GetRolesAsync(user).Result.ToList();
            var userExist = await _userManager.FindByNameAsync(user.UserName!);
            if (userExist == null)
            {
                return token;
            }

            switch (tokenType)
            {
                case TokenType.AccessToken:
                    key = Encoding.ASCII.GetBytes(_appSettings.AccessTokenKey!);
                    expiredTime = _appSettings.AccessTokenTime;
                    break;
                case TokenType.RefreshToken:
                    key = Encoding.ASCII.GetBytes(_appSettings.RefreshTokenKey!);
                    expiredTime = _appSettings.RefreshTokenTime;
                    break;
                default:
                    break;
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.UserName ?? ""),
                    new Claim(ClaimTypes.Email, user.Email ?? user.UserName ?? ""),
                    new Claim(ClaimTypes.Role, roles.Count <= 0 ? "guest" : roles[0]),
                    new Claim("lastlogin", user.LastLoginTime?.ToString("o") ?? string.Empty),
                    new Claim("picture",user.Avatar == null ? "" :user.Avatar),
                    new Claim("requiresPasswordChange", requiresPasswordChange.ToString().ToLower()),
                    new Claim("fullName", user.FullName == null ? "" : user.FullName.ToString()),
                }),
                Expires = DateTime.UtcNow.AddMinutes(expiredTime),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            //if (isSuperAdmin && isFirstLogin)
            //{
            //    tokenDescriptor.Subject.AddClaim(new Claim("defaultPassword", "Hello@123"));
            //}
            //if (accountType == AccountType.CallFlowByAdmin)
            //{
            //    var currentID = _currentUserService.UserId;
            //    //var isSupperAdmin = IsSuperAdminRole(currentID).Result;
            //    //if (isSupperAdmin)
            //    //{
            //    //    var userName = GetUserNameAsync(currentID).Result;
            //    //    tokenDescriptor.Subject.AddClaim(new Claim("backadmin", userName));
            //    //}
            //}
            token = tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at CreateToken. Ex: {0}", ex.Message);
        }
        return token;
    }
    private async Task<bool> SetTokenAsync(ApplicationUser user, string loginProvider, string tokenName, string value)
    {
        try
        {
            if (user != null)
            {
                var isSuccess = await _userManager.SetAuthenticationTokenAsync(user, loginProvider, tokenName, value);
                if (isSuccess.Succeeded) return true;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at SetTokenAsync. Ex: {0}", ex.Message);
        }
        return false;
    }

    public async Task<Result> RefreshToken()
    {
        Result rs = Result.Failure();
        try
        {
            var token = _currentUserService.Token?.Split(" ")?.Last();
            var validateToken = ValidateToken(token, TokenType.AccessToken);
            var userId = _currentUserService?.UserId ?? validateToken.UserId;

            if (validateToken != null && validateToken.IsValidToken && !string.IsNullOrEmpty(userId))
            {
                var user = await GetApplicationUserById(userId);
                if (user != null && validateToken.IsExpiredToken)
                {
                    //token is valid and is expired
                    //check refresh token
                    var refreshToken = await GetTokenAsync(user, "system", Utils.GetEnumMemberValue(TokenType.RefreshToken));
                    if (!string.IsNullOrEmpty(refreshToken))
                    {
                        validateToken = ValidateToken(refreshToken, TokenType.RefreshToken);
                        if (validateToken != null && validateToken.IsValidToken && !validateToken.IsExpiredToken)
                        {
                            var newAccessToken = await CreateToken(user, TokenType.AccessToken);
                            var newRefreshToken = await CreateToken(user, TokenType.RefreshToken);
                            //create new access token
                            if (!string.IsNullOrEmpty(newAccessToken) && !string.IsNullOrEmpty(newRefreshToken))
                            {
                                await SetTokenAsync(user, "system", Utils.GetEnumMemberValue(TokenType.RefreshToken), newRefreshToken);
                                rs = Result.Success(newAccessToken);
                                return rs;
                            }
                        }
                    }
                }
                else if (user != null && !validateToken.IsExpiredToken)
                {
                    rs = Result.Success(token);
                    return rs;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at RefreshToken. Ex: {0}", ex.Message);
        }
        rs = Result.Failure("Unauthorized");
        return rs;
    }

    public ValidateTokenModel ValidateToken(string token, TokenType tokenType)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var validateTokenModel = new ValidateTokenModel();
        if (string.IsNullOrEmpty(token))
            validateTokenModel.IsValidToken = false;
        else
        {
            try
            {
                byte[] key = null;
                switch (tokenType)
                {
                    case TokenType.AccessToken:
                        key = Encoding.ASCII.GetBytes(_appSettings.AccessTokenKey);
                        break;
                    case TokenType.RefreshToken:
                        key = Encoding.ASCII.GetBytes(_appSettings.RefreshTokenKey);
                        break;
                    default:
                        break;
                }

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    // set clockskew to zero so tokens expire exactly at token expiration time (instead of 5 minutes later)
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                validateTokenModel.Email = jwtToken.Claims.FirstOrDefault(x => x.Type == "name")?.Value;
                validateTokenModel.UserId = jwtToken.Claims.FirstOrDefault(x => x.Type == "nameid")?.Value;
                validateTokenModel.IsValidToken = true;
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Lifetime validation failed. The token is expired"))
                {
                    var jwtSecurityToken = tokenHandler.ReadJwtToken(token);
                    validateTokenModel.Email = jwtSecurityToken.Claims.FirstOrDefault(x => x.Type == "name")?.Value;
                    validateTokenModel.UserId = jwtSecurityToken.Claims.FirstOrDefault(x => x.Type == "nameid")?.Value;
                    validateTokenModel.IsExpiredToken = true;
                    validateTokenModel.IsValidToken = true;
                }
                else if (ex.Message.Contains("Signature validation failed. Token does not have a kid"))
                {
                    validateTokenModel.IsValidToken = false;
                }
                _logger.LogError("Exception at ValidateToken. Ex: {0}", ex.Message);
            }
        }
        return validateTokenModel;
    }

    public async Task<ApplicationUser> GetApplicationUserById(string userId)
    {
        var user = new ApplicationUser();
        try
        {
            user = await _userManager.FindByIdAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at GetApplicationUserById. Ex: {0}", ex.Message);
        }
        return user;
    }

    private async Task<string> GetTokenAsync(ApplicationUser user, string loginProvider, string tokenName)
    {
        const int maxRetries = 3;
        const int initialDelayMs = 100;

        for (int attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                if (user != null)
                {
                    return await _userManager.GetAuthenticationTokenAsync(user, loginProvider, tokenName);
                }
                return null;
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("Cannot Open when State is Connecting"))
            {
                if (attempt == maxRetries - 1)
                    throw;

                // Close the connection and wait before retrying
                try
                {
                    var connection = _context.Database.GetDbConnection();
                    if (connection.State != System.Data.ConnectionState.Closed)
                    {
                        await connection.CloseAsync();
                    }
                }
                catch (Exception closeEx)
                {
                    _logger.LogWarning("Error closing connection: {0}", closeEx.Message);
                }

                // Exponential backoff with jitter
                var delayMs = initialDelayMs * Math.Pow(2, attempt);
                var jitter = Random.Shared.Next(0, 50);
                await Task.Delay((int)delayMs + jitter);

                _logger.LogWarning("Retrying GetTokenAsync in {0}ms after closing connection. Attempt {1}/{2}. Ex: {3}",
                    (int)delayMs + jitter, attempt + 1, maxRetries, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError("Exception at GetTokenAsync. Ex: {0}", ex.Message);
                return null;
            }
        }
        return null;
    }
}
