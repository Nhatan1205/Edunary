using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Globalization;
using System.Net;
using System.Security.Claims;
using System.Text;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Users;
using Edunary.Application.Users.Queries.GetAdminUserStatusCountsQuery;
using Edunary.Application.Users.Queries.GetAdminOverviewSummaryQuery;
using Edunary.Application.Users.Queries.GetRegistrationTrendQuery;
using Edunary.Application.Users.Queries.GetNewVsReturningQuery;
using Edunary.Domain.Common;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;
using Edunary.Domain.Helpers;
using Edunary.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Protocols; 
using Microsoft.IdentityModel.Protocols.OpenIdConnect; 
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Edunary.Domain.Entities;


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
    private readonly IActivityLogService _activityLogService;
    private readonly IEmailService _emailService;

    public IdentityService(
        UserManager<ApplicationUser> userManager,
        IUserClaimsPrincipalFactory<ApplicationUser> userClaimsPrincipalFactory,
        IAuthorizationService authorizationService,
        RoleManager<ApplicationRole> roleManager,
        ILogger<IdentityService> logger,
        ApplicationDbContext context,
        IOptions<AppSettings> appSettings,
        ICurrentUserService currentUserService,
        IActivityLogService activityLogService,
        IEmailService emailService)
    {
        _userManager = userManager;
        _userClaimsPrincipalFactory = userClaimsPrincipalFactory;
        _authorizationService = authorizationService;
        _roleManager = roleManager;
        _logger = logger;
        _context = context;
        _appSettings = appSettings.Value;
        _currentUserService = currentUserService;
        _activityLogService = activityLogService;
        _emailService = emailService;
    }

    public async Task<string> GetUserNameAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        return user?.UserName;
    }

    public async Task<string> GetFullNameAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        return user?.FullName ?? user?.UserName;
    }

    public async Task<string> GetUserAvatarAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        return user?.Avatar;
    }

    public async Task<Result> Register(string userName, string phoneNumber, string email, string password, string fullName, string avatar = null)
    {
        Result rs = Result.Failure();
        try
        {
            IdentityResult result;
            var avatarUrl = string.IsNullOrWhiteSpace(avatar)
                ? $"https://ui-avatars.com/api/?name={WebUtility.UrlEncode(fullName.Trim())}&background=random" : avatar;
            var user = new ApplicationUser
            {
                UserName = userName,
                PhoneNumber = phoneNumber,
                Email = email,
                FullName = fullName,
                Avatar = avatarUrl,
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

    public async Task<Result> StartRegistration(string phoneNumber, string email, string password, string fullName)
    {
        try
        {
            if (await _userManager.FindByEmailAsync(email) != null || await _userManager.FindByNameAsync(email) != null)
            {
                return Result.Success(message: "You already have an account, please Sign In ");
            }

            var normalizedEmail = _userManager.NormalizeEmail(email);
            var existingPending = await _context.PendingRegistrations
                .Where(x => x.NormalizedEmail == normalizedEmail && x.UsedAt == null)
                .OrderByDescending(x => x.Created)
                .FirstOrDefaultAsync();

            var plainToken = NewVerificationToken();
            var tokenHash = HashToken(plainToken);
            var passwordHash = _userManager.PasswordHasher.HashPassword(null!, password);
            var expiresAt = DateTimeOffset.UtcNow.Add(RegistrationTokenTtl);

            if (existingPending == null)
            {
                existingPending = new PendingRegistration
                {
                    Email = email,
                    NormalizedEmail = normalizedEmail,
                    FullName = fullName,
                    PhoneNumber = phoneNumber ?? string.Empty,
                    PasswordHash = passwordHash,
                    TokenHash = tokenHash,
                    TokenExpiresAt = expiresAt,
                };
                _context.PendingRegistrations.Add(existingPending);
            }
            else
            {
                existingPending.Email = email;
                existingPending.FullName = fullName;
                existingPending.PhoneNumber = phoneNumber ?? string.Empty;
                existingPending.PasswordHash = passwordHash;
                existingPending.TokenHash = tokenHash;
                existingPending.TokenExpiresAt = expiresAt;
                existingPending.UsedAt = null;
            }

            await _context.SaveChangesAsync(CancellationToken.None);

            var verifyUrl = BuildVerifyUrl(GetVerifyBaseUrl(), plainToken);
            var emailContent = EmailTemplates.BuildRegistrationTemplate(fullName, verifyUrl, _appSettings.ClientUrl);
            await SendRegistrationEmailAsync(email, "Verify your email", emailContent);

            return Result.Success(message: "If the email is eligible, a verification link has been sent.");
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at StartRegistration. Ex: {0}", ex.Message);
            return Result.Failure("Unable to start registration. Please try again.");
        }
    }

    public async Task<Result> VerifyRegistration(string token)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return Result.Failure("Verification link is invalid or expired.");
            }

            var tokenHash = HashToken(token);
            var pending = await _context.PendingRegistrations
                .Where(x => x.TokenHash == tokenHash && x.UsedAt == null)
                .OrderByDescending(x => x.Created)
                .FirstOrDefaultAsync();

            if (pending == null || pending.TokenExpiresAt < DateTimeOffset.UtcNow)
            {
                return Result.Failure("Verification link is invalid or expired.");
            }

            if (await _userManager.FindByEmailAsync(pending.Email) != null)
            {
                pending.UsedAt = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync(CancellationToken.None);
                return Result.Failure("This email has already been registered.");
            }

            var createResult = await CreateVerifiedUserFromPending(pending);
            if (!createResult.Succeeded)
            {
                return createResult;
            }

            pending.UsedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync(CancellationToken.None);

            return Result.Success(message: "Email verified. Account created.");
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at VerifyRegistration. Ex: {0}", ex.Message);
            return Result.Failure("Verification link is invalid or expired.");
        }
    }

    public async Task<Result> ResendRegistrationVerification(string email)
    {
        try
        {
            var normalizedEmail = _userManager.NormalizeEmail(email) ?? string.Empty;
            var pending = await _context.PendingRegistrations
                .Where(x => x.NormalizedEmail == normalizedEmail && x.UsedAt == null)
                .OrderByDescending(x => x.Created)
                .FirstOrDefaultAsync();

            if (pending == null)
            {
                return Result.Success(message: "If the email is eligible, a verification link has been sent.");
            }

            if (!CanSendEmailToday(normalizedEmail))
            {
                return Result.Success(message: "If the email is eligible, a link has been sent. Please wait before requesting another.");
            }

            var plainToken = NewVerificationToken();
            pending.TokenHash = HashToken(plainToken);
            pending.TokenExpiresAt = DateTimeOffset.UtcNow.Add(RegistrationTokenTtl);
            await _context.SaveChangesAsync(CancellationToken.None);

            var verifyUrl = BuildVerifyUrl(GetVerifyBaseUrl(), plainToken);
            var emailContent = EmailTemplates.BuildRegistrationTemplate(pending.FullName, verifyUrl, _appSettings.ClientUrl);
            await SendRegistrationEmailAsync(email, "Verify your email", emailContent);
            RegisterEmailSent(normalizedEmail);

            return Result.Success(message: "If the email is eligible, a verification link has been sent.");
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at ResendRegistrationVerification. Ex: {0}", ex.Message);
            return Result.Failure("Unable to resend verification email. Please try again.");
        }
    }

    public async Task<Result> ForgotPassword(string email)
    {
        try
        {
            var normalizedEmail = _userManager.NormalizeEmail(email) ?? string.Empty;
            if (!CanSendEmailToday(normalizedEmail))
            {
                return Result.Success(message: "If the email is eligible, a link has been sent. Please wait before requesting another.");
            }

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null || !user.EmailConfirmed)
            {
                return Result.Success(message: "If the email is eligible, a password reset link has been sent.");
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetUrl = BuildResetPasswordUrl(GetResetPasswordBaseUrl(), email, token);
            var emailContent = EmailTemplates.BuildResetPasswordTemplate(user.FullName ?? user.UserName ?? "there", resetUrl, _appSettings.ClientUrl);
            await _emailService.SendBulkEmailsAsync(new[] { email }, "Reset your Edunary password", emailContent);
            RegisterEmailSent(normalizedEmail);

            return Result.Success(message: "If the email is eligible, a password reset link has been sent.");
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at ForgotPassword. Ex: {0}", ex.Message);
            return Result.Success(message: "If the email is eligible, a password reset link has been sent.");
        }
    }

    public async Task<Result> ResetPassword(string email, string token, string newPassword)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(newPassword))
            {
                return Result.Failure("Password reset link is invalid or expired.");
            }

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return Result.Failure("Password reset link is invalid or expired.");
            }

            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            if (!result.Succeeded)
            {
                return Result.Failure(result.Errors.Select(x => x.Description).ToArray());
            }

            return Result.Success(message: "Password has been reset successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at ResetPassword. Ex: {0}", ex.Message);
            return Result.Failure("Password reset link is invalid or expired.");
        }
    }

    private string GetVerifyBaseUrl()
    {
        var clientUrl = string.IsNullOrWhiteSpace(_appSettings.ClientUrl)
            ? "https://localhost:44447"
            : _appSettings.ClientUrl.TrimEnd('/');

        return $"{clientUrl}/verify-registration";
    }

    private static string HashToken(string token)
    {
        using var sha = System.Security.Cryptography.SHA256.Create();                                                                                          
        var bytes = Encoding.UTF8.GetBytes(token);                                                                                
        var hash = sha.ComputeHash(bytes);                                                                                                    
        return Convert.ToHexString(hash);   
    }

    private static string BuildVerifyUrl(string verifyBaseUrl, string token)
    {
        var separator = verifyBaseUrl.Contains('?') ? "&" : "?";
        return $"{verifyBaseUrl}{separator}token={Uri.EscapeDataString(token)}";
    }

    private string GetResetPasswordBaseUrl()
    {
        var clientUrl = string.IsNullOrWhiteSpace(_appSettings.ClientUrl)
            ? "https://localhost:44447"
            : _appSettings.ClientUrl.TrimEnd('/');

        return $"{clientUrl}/reset-password";
    }

    private static string BuildResetPasswordUrl(string resetBaseUrl, string email, string token)
    {
        var separator = resetBaseUrl.Contains('?') ? "&" : "?";
        return $"{resetBaseUrl}{separator}email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}";
    }

    private async Task SendRegistrationEmailAsync(string email, string subject, string content)
    {
        await _emailService.SendBulkEmailsAsync(new[] { email }, subject, content);
    }

    private async Task<Result> CreateVerifiedUserFromPending(PendingRegistration pending)
    {
        var avatarUrl = $"https://ui-avatars.com/api/?name={WebUtility.UrlEncode(pending.FullName.Trim())}&background=random";
        var user = new ApplicationUser
        {
            UserName = pending.Email,
            PhoneNumber = pending.PhoneNumber,
            Email = pending.Email,
            FullName = pending.FullName,
            Avatar = avatarUrl,
            PasswordHash = pending.PasswordHash,
            EmailConfirmed = true
        };

        var createResult = await _userManager.CreateAsync(user);
        if (!createResult.Succeeded)
        {
            return Result.Failure(createResult.Errors.First().Description);
        }

        var roleResult = await _userManager.AddToRoleAsync(user, "User");
        if (!roleResult.Succeeded)
        {
            await _userManager.DeleteAsync(user);
            return Result.Failure(roleResult.Errors.First().Description);
        }

        return Result.Success();
    }

    private static string NewVerificationToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    }

    private static readonly TimeSpan RegistrationTokenTtl = TimeSpan.FromHours(24);
    private const int MaxEmailSendsPerDay = 3;

    private static readonly ConcurrentDictionary<string, DateTime[]> _emailSendLog = new();

    private static bool CanSendEmailToday(string normalizedEmail)
    {
        if (string.IsNullOrEmpty(normalizedEmail)) return false;
        var cutoff = DateTime.UtcNow.Date;
        if (!_emailSendLog.TryGetValue(normalizedEmail, out var timestamps))
            return true;

        var today = timestamps.Where(t => t.Date == cutoff).ToArray();
        return today.Length < MaxEmailSendsPerDay;
    }

    private static void RegisterEmailSent(string normalizedEmail)
    {
        if (string.IsNullOrEmpty(normalizedEmail)) return;
        var now = DateTime.UtcNow;
        _emailSendLog.AddOrUpdate(
            normalizedEmail,
            _ => new[] { now },
            (_, existing) =>
            {
                var cutoff = now.Date;
                var today = existing.Where(t => t.Date == cutoff).ToList();
                today.Add(now);
                return today.ToArray();
            });
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
                    Description = user.Description,
                    Headline = user.Headline,
                    Links = user.Links,
                    BankAccountHolder = user.BankAccountHolder,
                    Bank = user.Bank,
                    BankNumber = user.BankNumber
                };

                userModel.Disable = user.Status == UserStatus.Banned || user.Status == UserStatus.Suspended;


            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at GetUserById. Ex: {0}", ex.Message);
        }

        return userModel;
    }

    public async Task<Result> UpdateUserAsync(UserModel model)
    {
        var user = await _userManager.FindByIdAsync(model.Id);
        if (user == null)
        {
            return Result.Failure("User not found.");
        }

        user.FullName = model.FullName;
        user.PhoneNumber = model.PhoneNumber;
        user.Headline = model.Headline;
        user.Description = model.Description;
        user.Links = model.Links;

        var updateResult = await _userManager.UpdateAsync(user);
        if (updateResult.Succeeded)
        {
            return Result.Success("User updated successfully.");
        }
        return Result.Failure("Update user failed");
    }

    public async Task<Result> UpdatePayoutAccountAsync(string userId, string bank, string bankNumber, string bankAccountHolder)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Result.Failure("User not found.");
        }

        user.Bank = bank;
        user.BankNumber = bankNumber;
        user.BankAccountHolder = bankAccountHolder;

        var updateResult = await _userManager.UpdateAsync(user);
        if (updateResult.Succeeded)
        {
            return Result.Success("Payout account updated successfully.");
        }

        return Result.Failure("Update payout account failed");
    }

    public async Task<Result> UpdateUserAvatarAsync(string avatarUrl, string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Result.Failure("User not found.");
        }

        user.Avatar = avatarUrl;

        var updateResult = await _userManager.UpdateAsync(user);

        if (updateResult.Succeeded)
        {
            return Result.Success("User avatar updated successfully.");
        }

        return Result.Failure("Update avatar failed.");
    }

    public async Task<Result> Login(string userName, string passWord, AccountType accountType, bool? forceFirstLogin = null, string defaultPassword = null)
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
                if (accountType == AccountType.System)
                {
                    var validPassword = await _userManager.CheckPasswordAsync(user, passWord);
                    if (!validPassword)
                    {
                        rs = Result.Failure("Email/User Name or Password is incorrect");
                        isLogin = false;
                    }
                }
                if (isLogin)
                {
                    // Block banned/suspended users from logging in
                    if (user.Status == UserStatus.Banned)
                    {
                        rs = Result.Failure("Your account has been banned.");
                        isLogin = false;
                    }
                    else if (user.Status == UserStatus.Suspended)
                    {
                        if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow)
                        {
                            rs = Result.Failure($"Your account is suspended until {user.LockoutEnd.Value:yyyy-MM-dd}.");
                            isLogin = false;
                        }
                        else
                        {
                            // Suspension expired → reactivate
                            user.Status = UserStatus.Active;
                            user.LockoutEnd = null;
                        }
                    }
                }
                if (isLogin)
                {
                    bool isFirstLogin = forceFirstLogin ?? (user.LastLoginTime == null);
                    user.LastLoginTime = DateTime.Now;
                    // Reset Inactive → Active on login
                    if (user.Status == UserStatus.Inactive)
                        user.Status = UserStatus.Active;
                    await _userManager.UpdateAsync(user);
                    string accessToken = await CreateToken(user, TokenType.AccessToken, false, accountType, isFirstLogin, defaultPassword);
                    string refreshToken = await CreateToken(user, TokenType.RefreshToken);
                    await SetTokenAsync(user, Utils.GetEnumMemberValue(AccountType.System), Utils.GetEnumMemberValue(TokenType.RefreshToken), refreshToken);
                    rs = Result.Success(accessToken);

                    // Activity log: track login (non-blocking via Hangfire)
                    _activityLogService.EnqueueLog(new ActivityLogEntry
                    {
                        UserId = user.Id,
                        ActivityType = ActivityType.Login,
                        Description = "Have logged into the system"
                    });
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at Login. Ex: {0}", ex.Message);
        }

        return rs;
    }

    public async Task<string> CreateToken(ApplicationUser user, TokenType tokenType, bool newAccount = false, AccountType accountType = AccountType.System, bool isFirstLogin = false, string defaultPassword = null)
    {
        bool requiresPasswordChange = false;
        string token = string.Empty;
        byte[] key = null;
        int expiredTime = 60;
        List<string> permission = new List<string>();
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var roles = _userManager.GetRolesAsync(user).Result.ToList();
            var userExist = await _userManager.FindByNameAsync(user.UserName!);
            if (userExist == null)
            {
                return token;
            }
            bool isSocialAccount = accountType == AccountType.Social;
            if (isSocialAccount && isFirstLogin)
            {
                requiresPasswordChange = true;
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
                    new Claim("isFirstLogin", isFirstLogin.ToString().ToLower()),
                }),
                Expires = DateTime.UtcNow.AddMinutes(expiredTime),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            
            // Add defaultPassword claim for social login first time users
            if (isSocialAccount && isFirstLogin && !string.IsNullOrEmpty(defaultPassword))
            {
                tokenDescriptor.Subject.AddClaim(new Claim("defaultPassword", defaultPassword));
            }
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
                if (user != null)
                {
                    // Check refresh token
                    var refreshToken = await GetTokenAsync(user, "system", Utils.GetEnumMemberValue(TokenType.RefreshToken));
                    if (!string.IsNullOrEmpty(refreshToken))
                    {
                        var validateRefreshToken = ValidateToken(refreshToken, TokenType.RefreshToken);
                        if (validateRefreshToken != null && validateRefreshToken.IsValidToken && !validateRefreshToken.IsExpiredToken)
                        {
                            var newAccessToken = await CreateToken(user, TokenType.AccessToken);
                            
                            if (!string.IsNullOrEmpty(newAccessToken))
                            {
                                rs = Result.Success(newAccessToken);
                                return rs;
                            }
                        }
                        else
                        {
                            rs = Result.Failure("Refresh token expired. Please login again.");
                            return rs;
                        }
                    }
                    else
                    {
                        rs = Result.Failure("No refresh token found.");
                        return rs;
                    }
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

    public async Task<Result> GetInforSocialUser(string accessToken, string provider)
    {

        Result rs = Result.Failure();
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(accessToken) as JwtSecurityToken;
            dynamic email = null;
            dynamic fullName = null;
            dynamic avatar = null;

            if (provider.Equals("MICROSOFT"))
            {
                var verifyToken = await ValidateToken(accessToken);
                if (verifyToken != null)
                {
                    var data = verifyToken.Claims.Where(claim => claim.Type == "preferred_username").FirstOrDefault();
                    if (data != null)
                    {
                        email = data.Value;
                    }
                }
            }

            if (provider.Equals("GOOGLE"))
            {
                var file = Path.Combine(Directory.GetCurrentDirectory(), "keys", "sso_key.json");
                var gg = JsonConvert.DeserializeObject<GoogleInstance>(File.ReadAllText(file));
                using (HttpClient httpClient = new HttpClient())
                {
                    string googleEndpoint = $"https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={accessToken}";
                    HttpResponseMessage response = await httpClient.GetAsync(googleEndpoint);

                    if (response.IsSuccessStatusCode)
                    {
                        // Parse the response to check if the client ID matches
                        var responseData = await response.Content.ReadAsAsync<GoogleToken>();
                        if (responseData != null && responseData.aud == gg.ClientIdGoogle)
                        {
                            email = responseData.email;
                            fullName = responseData.name;
                            avatar = responseData.picture;
                        }
                    }
                }
            }

            if (!string.IsNullOrEmpty(email))
            {
                var user = await _userManager.FindByNameAsync(email);
                string defaultPassword = null;
                
                if (user == null)
                {
                    defaultPassword = GenerateDefaultPassword();
                    var rsRegister = await Register(email, null, email, defaultPassword, fullName, avatar);
                    if (!rsRegister.Succeeded)
                    {
                        return Result.Failure(rsRegister.Errors);
                    }
                    user = await _userManager.FindByNameAsync(email);
                }
                bool isFirstLogin = user.LastLoginTime == null;
                rs = await Login(email, null, AccountType.Social, isFirstLogin, defaultPassword);
            }
            return rs;

        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at GetInforSocialUser. Ex: {0}", ex.Message);
        }
        return rs;
    }

    private string GenerateDefaultPassword()
    {
        // Generate a secure random password that meets all requirements
        const string lowercase = "abcdefghijklmnopqrstuvwxyz";
        const string uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string digits = "0123456789";
        const string special = "!@#$%^&*";
        
        var random = new Random();
        var password = new char[12];
        
        // Ensure at least one of each required character type
        password[0] = lowercase[random.Next(lowercase.Length)];
        password[1] = uppercase[random.Next(uppercase.Length)];
        password[2] = digits[random.Next(digits.Length)];
        password[3] = special[random.Next(special.Length)];
        
        // Fill the rest randomly
        string allChars = lowercase + uppercase + digits + special;
        for (int i = 4; i < password.Length; i++)
        {
            password[i] = allChars[random.Next(allChars.Length)];
        }
        
        // Shuffle the password
        return new string(password.OrderBy(x => random.Next()).ToArray());
    }

    private async Task<JwtSecurityToken> ValidateToken(string accessToken)
    {
        try
        {
            var file = Path.Combine(Directory.GetCurrentDirectory(), "keys", "sso_key.json");
            var ms = JsonConvert.DeserializeObject<MicrosoftInstance>(File.ReadAllText(file));
            string instance = "https://login.microsoftonline.com/";
            string tennantId = ms.TennantId;
            string clientId = ms.ClientIdMS;
            string endpoint = string.Format(@"{0}{1}/v2.0/.well-known/openid-configuration", instance, tennantId);
            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
            var configManager = new ConfigurationManager<OpenIdConnectConfiguration>(endpoint, new OpenIdConnectConfigurationRetriever());
            OpenIdConnectConfiguration config = await configManager.GetConfigurationAsync();

            var validationParameters = new TokenValidationParameters
            {
                ValidAudience = clientId,
                IssuerSigningKeys = config.SigningKeys,
                ValidateIssuer = false,
                ValidIssuer = instance,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                RequireExpirationTime = false,
                ValidateLifetime = false,

            };


            SecurityToken validatedToken;
            var principal = tokenHandler.ValidateToken(accessToken, validationParameters, out validatedToken);

            return validatedToken as JwtSecurityToken;

        }
        catch (SecurityTokenException ex)
        {
            _logger.LogError("Exception at ValidateToken. Ex: {0}", ex.Message);
            return null;
        }

    }

    public async Task<bool> CheckPassword(string userId, string password)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            return await _userManager.CheckPasswordAsync(user, password);
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at CheckPassword. Ex: {0}", ex.Message);
            return false;
        }
    }

    public async Task<Result> ChangePassword(string userId, string newPassword)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Result.Failure("User not found.");
            }

            // Remove old password
            await _userManager.RemovePasswordAsync(user);

            // Add new password
            var result = await _userManager.AddPasswordAsync(user, newPassword);

            if (!result.Succeeded)
            {
                return Result.Failure(result.Errors.First().Description);
            }

            return Result.Success("Password changed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at ChangePassword. Ex: {0}", ex.Message);
            return Result.Failure($"An error occurred while changing password: {ex.Message}");
        }
    }

    public async Task<AdminUserStatusCountsDto> GetUserStatusCountsAsync()
    {
        try
        {
            // 1 query GROUP BY duy nhất — không filter gì, trả về count thực tế trong DB
            // SQL: SELECT Status, COUNT(*) FROM AspNetUsers GROUP BY Status
            var groups = await _context.Users
                .GroupBy(u => u.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var dict = groups.ToDictionary(x => x.Status, x => x.Count);

            return new AdminUserStatusCountsDto
            {
                Total     = dict.Values.Sum(),
                Active    = dict.GetValueOrDefault(UserStatus.Active,    0),
                Inactive  = dict.GetValueOrDefault(UserStatus.Inactive,  0),
                Suspended = dict.GetValueOrDefault(UserStatus.Suspended, 0),
                Banned    = dict.GetValueOrDefault(UserStatus.Banned,    0),
            };
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at GetUserStatusCountsAsync. Ex: {0}", ex.Message);
            return new AdminUserStatusCountsDto();
        }
    }

    public async Task<(IReadOnlyList<UserIdentityDto> Users, int TotalCount)> GetFilteredUsersAsync(
        string searchText, string roleFilter, string statusFilter,
        string sortBy, int pageNumber, int pageSize)
    {
        try
        {
            var query = _context.Users.AsQueryable();

            // ── Filter: Search theo tên hoặc email ───────────────────────────────
            if (!string.IsNullOrWhiteSpace(searchText))
            {
                var search = searchText.Trim().ToLower();
                query = query.Where(u =>
                    (u.FullName != null && u.FullName.ToLower().Contains(search)) ||
                    (u.Email != null && u.Email.ToLower().Contains(search)));
            }

            // ── Filter: Status — query trực tiếp column, không computed ──────────
            if (!string.IsNullOrWhiteSpace(statusFilter)
                && Enum.TryParse<UserStatus>(statusFilter, out var parsedStatus))
            {
                query = query.Where(u => u.Status == parsedStatus);
            }

            // ── Filter: Role — subquery vào AspNetUserRoles (1 query, không N+1) ─
            if (!string.IsNullOrWhiteSpace(roleFilter))
            {
                var roleId = await _context.Roles
                    .Where(r => r.Name == roleFilter)
                    .Select(r => r.Id)
                    .FirstOrDefaultAsync();

                if (roleId != null)
                {
                    // EF Core translate thành: WHERE Id IN (SELECT UserId FROM AspNetUserRoles WHERE RoleId = @roleId)
                    var userIdsWithRole = _context.UserRoles
                        .Where(ur => ur.RoleId == roleId)
                        .Select(ur => ur.UserId);
                    query = query.Where(u => userIdsWithRole.Contains(u.Id));
                }
            }

            // ── Sort ─────────────────────────────────────────────────────────────
            query = sortBy switch
            {
                "name" => query.OrderBy(u => u.FullName),
                "lastLogin" => query.OrderByDescending(u => u.LastLoginTime),
                _ => query.OrderByDescending(u => u.CreatedAt)
            };

            var totalCount = await query.CountAsync();

            var users = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (!users.Any())
                return (Array.Empty<UserIdentityDto>(), totalCount);

            // ── Batch fetch Roles: 1 JOIN query cho TẤT CẢ users trong trang ─────
            // Thay vì N lần GetRolesAsync → chỉ 1 query với WHERE IN (...)
            var userIds = users.Select(u => u.Id).ToList();
            var userRolePairs = await _context.UserRoles
                .Where(ur => userIds.Contains(ur.UserId))
                .Join(_context.Roles,
                    ur => ur.RoleId,
                    r => r.Id,
                    (ur, r) => new { ur.UserId, RoleName = r.Name })
                .ToListAsync();

            // Group theo userId → Dictionary cho O(1) lookup
            var rolesDict = userRolePairs
                .GroupBy(x => x.UserId)
                .ToDictionary(g => g.Key, g => g.Select(x => x.RoleName).ToList());

            // ── Map sang UserIdentityDto — Application layer sẽ ghép business data
            var result = users.Select(u => new UserIdentityDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Avatar = u.Avatar,
                Headline = u.Headline,
                PhoneNumber = u.PhoneNumber,
                Roles = rolesDict.TryGetValue(u.Id, out var roles) ? roles : new List<string>(),
                Status = u.Status,
                LockoutEnd = u.LockoutEnd,
                LastLoginTime = u.LastLoginTime,
                CreatedAt = u.CreatedAt,
            }).ToList();

            return (result.AsReadOnly(), totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at GetFilteredUsersAsync. Ex: {0}", ex.Message);
            return (Array.Empty<UserIdentityDto>(), 0);
        }
    }

    public async Task<UserIdentityDto> GetUserIdentityByIdAsync(string userId)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return null;

            // Single user → GetRolesAsync là đủ, không cần batch
            var roles = await _userManager.GetRolesAsync(user);

            return new UserIdentityDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Avatar = user.Avatar,
                Headline = user.Headline,
                Description = user.Description,
                Links = user.Links,
                PhoneNumber = user.PhoneNumber,
                Roles = roles.ToList(),
                Status = user.Status,
                LockoutEnd = user.LockoutEnd,
                LastLoginTime = user.LastLoginTime,
                CreatedAt = user.CreatedAt,
            };
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at GetUserIdentityByIdAsync. Ex: {0}", ex.Message);
            return null;
        }
    }

    public async Task<List<UserIdentityDto>> GetUserIdentitiesByIdsAsync(
        List<string> ids, CancellationToken cancellationToken)
    {
        try
        {
            var users = await _context.Users
                .Where(u => ids.Contains(u.Id))
                .Select(u => new UserIdentityDto
                {
                    Id            = u.Id,
                    FullName      = u.FullName,
                    Email         = u.Email,
                    Avatar        = u.Avatar,
                    Status        = u.Status,
                    LastLoginTime = u.LastLoginTime,
                    CreatedAt     = u.CreatedAt,
                })
                .ToListAsync(cancellationToken);

            return users;
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at GetUserIdentitiesByIdsAsync. Ex: {0}", ex.Message);
            return new List<UserIdentityDto>();
        }
    }

    public async Task<List<string>> SearchUserIdsByNameOrEmailAsync(
        string nameKeyword, string emailKeyword, CancellationToken cancellationToken)
    {
        try
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(nameKeyword))
            {
                var n = nameKeyword.Trim().ToLower();
                query = query.Where(u => u.FullName != null && u.FullName.ToLower().Contains(n));
            }

            if (!string.IsNullOrWhiteSpace(emailKeyword))
            {
                var e = emailKeyword.Trim().ToLower();
                query = query.Where(u => u.Email != null && u.Email.ToLower().Contains(e));
            }

            return await query.Select(u => u.Id).ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at SearchUserIdsByNameOrEmailAsync. Ex: {0}", ex.Message);
            return new List<string>();
        }
    }

    public async Task<Result> AddUserAsync(string email, string fullName, string password)
    {
        try
        {
            var existingUser = await _userManager.FindByEmailAsync(email);
            if (existingUser != null)
                return Result.Failure("An account with this email already exists.");

            return await Register(email, null, email, password, fullName);
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at AddUserAsync. Ex: {0}", ex.Message);
            return Result.Failure($"An unexpected error occurred: {ex.Message}");
        }
    }

    public async Task<Result> RestrictUserAsync(string userId, string currentAdminId, int? durationDays)
    {
        try
        {
            if (userId == currentAdminId)
                return Result.Failure("Cannot restrict your own account.");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Result.Failure("User not found.");

            if (durationDays.HasValue)
            {
                user.Status = UserStatus.Suspended;
                await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddDays(durationDays.Value));
                return Result.Success($"User has been suspended for {durationDays.Value} day(s).");
            }
            else
            {
                user.Status = UserStatus.Banned;
                await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
                return Result.Success("User has been permanently banned.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at RestrictUserAsync. Ex: {0}", ex.Message);
            return Result.Failure($"An unexpected error occurred: {ex.Message}");
        }
    }

    public async Task<Result> UnbanUserAsync(string userId)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Result.Failure("User not found.");

            user.Status = UserStatus.Active;
            await _userManager.SetLockoutEndDateAsync(user, null);
            return Result.Success("User has been unbanned successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at UnbanUserAsync. Ex: {0}", ex.Message);
            return Result.Failure($"An unexpected error occurred: {ex.Message}");
        }
    }

    public async Task<Result> ChangeUserRoleAsync(string userId, string newRole, string currentAdminId)
    {
        try
        {
            if (userId == currentAdminId)
                return Result.Failure("Cannot change your own role.");

            if (newRole != Roles.User && newRole != Roles.Administrator)
                return Result.Failure("Invalid role. Must be 'User' or 'Administrator'.");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Result.Failure("User not found.");

            var currentRoles = await _userManager.GetRolesAsync(user);

            if (currentRoles.Contains(newRole))
                return Result.Failure($"User already has role '{newRole}'.");

            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
                return Result.Failure("Failed to remove current roles.");

            var addResult = await _userManager.AddToRoleAsync(user, newRole);
            if (!addResult.Succeeded)
                return Result.Failure(addResult.Errors.First().Description);

            return Result.Success($"User role changed to '{newRole}' successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at ChangeUserRoleAsync. Ex: {0}", ex.Message);
            return Result.Failure($"An unexpected error occurred: {ex.Message}");
        }
    }

    public async Task<OverviewStatsResult> GetOverviewStatsAsync(CancellationToken cancellationToken)
    {
        try
        {
            var now = DateTime.UtcNow;
            var sevenDaysAgo = now.AddDays(-7);
            var thirtyDaysAgo = now.AddDays(-30);
            var sixtyDaysAgo = now.AddDays(-60);

            //1. get status counts, group by status
            var groups = await _context.Users
                .GroupBy(u => u.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            var dict = groups.ToDictionary(x => x.Status, x => x.Count);

            var statusActive    = dict.GetValueOrDefault(UserStatus.Active,    0);
            var statusInactive  = dict.GetValueOrDefault(UserStatus.Inactive,  0);
            var statusSuspended = dict.GetValueOrDefault(UserStatus.Suspended, 0);
            var statusBanned    = dict.GetValueOrDefault(UserStatus.Banned,    0);

            //2. trend counts
            var trends = await _context.Users
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    ActiveBefore7d  = g.Count(u => u.Status == UserStatus.Active && u.CreatedAt <= sevenDaysAgo),
                    New30d          = g.Count(u => u.CreatedAt >= thirtyDaysAgo),
                    NewPrev30d      = g.Count(u => u.CreatedAt >= sixtyDaysAgo && u.CreatedAt < thirtyDaysAgo),
                })
                .FirstOrDefaultAsync(cancellationToken);

            // % trend: (current - previous) / previous * 100, rounded to 1 decimal
            static double CalcTrend(int current, int previous)
                => previous == 0 ? 0 : Math.Round((double)(current - previous) / previous * 100, 1);

            return new OverviewStatsResult
            {
                ActiveUsers      = statusActive,
                ActiveUsersTrend = CalcTrend(statusActive, trends?.ActiveBefore7d ?? 0),
                NewUsers30d      = trends?.New30d ?? 0,
                NewUsersTrend    = CalcTrend(trends?.New30d ?? 0, trends?.NewPrev30d ?? 0),

                StatusActive    = statusActive,
                StatusInactive  = statusInactive,
                StatusSuspended = statusSuspended,
                StatusBanned    = statusBanned,
            };
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at GetOverviewStatsAsync. Ex: {0}", ex.Message);
            return new OverviewStatsResult();
        }
    }

    public async Task<RegistrationTrendDto> GetRegistrationTrendAsync(
        string range, CancellationToken cancellationToken)
    {
        try
        {
            var now = DateTime.UtcNow;
            bool groupByDay;
            DateTime startDate;

            switch (range)
            {
                case "7d":  startDate = now.AddDays(-7);    groupByDay = true;  break;
                case "3m":  startDate = now.AddMonths(-3);  groupByDay = false; break;
                case "12m": startDate = now.AddMonths(-12); groupByDay = false; break;
                default:    startDate = now.AddDays(-30);   groupByDay = true;  break; 
            }

            if (groupByDay)
            {
                // GROUP BY date — fill missing dates with 0
                var raw = await _context.Users
                    .Where(u => u.CreatedAt >= startDate)
                    .GroupBy(u => u.CreatedAt.Date)
                    .Select(g => new { Date = g.Key, Count = g.Count() })
                    .OrderBy(x => x.Date)
                    .ToListAsync(cancellationToken);

                var dict = raw.ToDictionary(x => x.Date, x => x.Count);
                var labels = new List<string>();
                var data   = new List<int>();

                for (var d = startDate.Date; d <= now.Date; d = d.AddDays(1))
                {
                    labels.Add(d.ToString("MMM d", CultureInfo.InvariantCulture));
                    data.Add(dict.GetValueOrDefault(d, 0));
                }

                return new RegistrationTrendDto { Period = range, Labels = labels, Data = data };
            }
            else
            {
                // GROUP BY month
                var raw = await _context.Users
                    .Where(u => u.CreatedAt >= startDate)
                    .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
                    .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                    .OrderBy(x => x.Year).ThenBy(x => x.Month)
                    .ToListAsync(cancellationToken);

                var dict   = raw.ToDictionary(x => new DateTime(x.Year, x.Month, 1), x => x.Count);
                var labels = new List<string>();
                var data   = new List<int>();

                var cursor = new DateTime(startDate.Year, startDate.Month, 1);
                var end    = new DateTime(now.Year, now.Month, 1);
                while (cursor <= end)
                {
                    labels.Add(cursor.ToString("MMM", CultureInfo.InvariantCulture));
                    data.Add(dict.GetValueOrDefault(cursor, 0));
                    cursor = cursor.AddMonths(1);
                }

                return new RegistrationTrendDto { Period = range, Labels = labels, Data = data };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at GetRegistrationTrendAsync. Ex: {0}", ex.Message);
            return new RegistrationTrendDto { Period = range };
        }
    }

    public async Task<NewVsReturningDto> GetNewVsReturningAsync(
        int year, CancellationToken cancellationToken)
    {
        try
        {
            var currentMonth = DateTime.UtcNow.Year == year ? DateTime.UtcNow.Month : 12;

            var raw = await _context.Users
                .Where(u => u.CreatedAt.Year == year)
                .GroupBy(u => u.CreatedAt.Month)
                .Select(g => new { Month = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            var dict   = raw.ToDictionary(x => x.Month, x => x.Count);
            var labels  = new List<string>();
            var newUsers = new List<int>();

            for (int m = 1; m <= currentMonth; m++)
            {
                labels.Add(new DateTime(year, m, 1).ToString("MMM", CultureInfo.InvariantCulture));
                newUsers.Add(dict.GetValueOrDefault(m, 0));
            }

            // #TODO: ReturningUsers requires LoginHistory table.
            // LastLoginTime only stores the LAST login — cannot determine per-month returning users.
            // Returning 0 as placeholder. Future: Add LoginHistory entity, then:
            // COUNT DISTINCT UserId WHERE CreatedAt < month_start AND MONTH(LoginDate) = m AND YEAR = year
            var returningUsers = Enumerable.Repeat(0, labels.Count).ToList();

            return new NewVsReturningDto
            {
                Year           = year,
                Labels         = labels,
                NewUsers       = newUsers,
                ReturningUsers = returningUsers,
            };
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception at GetNewVsReturningAsync. Ex: {0}", ex.Message);
            return new NewVsReturningDto { Year = year };
        }
    }

}
