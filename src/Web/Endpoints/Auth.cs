using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Common;
using Edunary.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class Auth : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup(this)
            .MapPost(Login, "login")
            .MapPost(Register, "register")
            .MapGet(VerifyRegistration, "verify-registration")
            .MapPost(ResendVerification, "resend-verification")
            .MapPost(ForgotPassword, "forgot-password")
            .MapPost(ResetPassword, "reset-password")
            .MapGet(RefreshToken, "refresh-token")
            .MapPost(LoginWithSocialAccount, "loginwithsocial");
    }

    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    public async Task<IResult> Login(IIdentityService identityService, [FromBody] AuthenticateModel model)
    {
        var rs = await identityService.Login(model.Email, model.Password, AccountType.System);

        if (!rs.Succeeded)
        {
            return Results.BadRequest(new { ErrorMessage = rs.Message });
        }
        else
        {
            return Results.Ok(new LoginResponse { Token = rs.Data });
        }
    }

    public async Task<Result> Register(
        IIdentityService identityService,
        [FromBody] AuthenticateModel model)
    {
        var result = await identityService.StartRegistration(
            model.PhoneNumber, model.Email, model.Password!, model.FullName!);

        return result;
    }

    public async Task<Result> VerifyRegistration(IIdentityService identityService, string token)
    {
        var result = await identityService.VerifyRegistration(token);

        return result;
    }

    public async Task<Result> ResendVerification(
        IIdentityService identityService,
        [FromBody] ResendVerificationRequest request)
    {
        var result = await identityService.ResendRegistrationVerification(request.Email);

        return result;
    }

    public async Task<Result> ForgotPassword(
        IIdentityService identityService,
        [FromBody] ForgotPasswordRequest request)
    {
        var result = await identityService.ForgotPassword(request.Email);

        return result;
    }

    public async Task<Result> ResetPassword(
        IIdentityService identityService,
        [FromBody] ResetPasswordRequest request)
    {
        if (!string.Equals(request.NewPassword, request.ConfirmPassword, StringComparison.Ordinal))
        {
            return Result.Failure("Password confirmation does not match.");
        }

        var result = await identityService.ResetPassword(request.Email, request.Token, request.NewPassword);

        return result;
    }

    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    public async Task<IResult> RefreshToken(IIdentityService identityService)
    {
        var rs = await identityService.RefreshToken();
        if (!rs.Succeeded)
        {
            return Results.Json(
                new { ErrorMessage = rs.Message },
                statusCode: StatusCodes.Status401Unauthorized
            );
        }

        return Results.Ok(new LoginResponse { Token = rs.Data });
    }

    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    public async Task<IResult> LoginWithSocialAccount(IIdentityService identityService, string token, string provider)
    {
        var rs = await identityService.GetInforSocialUser(token, provider);

        if (!rs.Succeeded)
        {
            return Results.BadRequest(new { ErrorMessage = rs.Message });
        }
        return Results.Ok(new LoginResponse { Token = rs.Data });
    }
}

public class ResendVerificationRequest
{
    public string Email { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}
