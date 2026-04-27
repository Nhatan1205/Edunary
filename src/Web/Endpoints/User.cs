
using Edunary.Application.Common.Models;
using Edunary.Application.Users.Commands.ChangePasswordCommand;
using Edunary.Application.Users.Commands.ChangeUserRoleCommand;
using Edunary.Application.Users.Commands.CreateUserCommand;
using Edunary.Application.Users.Commands.RestrictUserCommand;
using Edunary.Application.Users.Commands.UnbanUserCommand;
using Edunary.Application.Users.Commands.UpdatePayoutAccountCommand;
using Edunary.Application.Users.Commands.UpdateUserAvatarCommand;
using Edunary.Application.Users.Commands.UpdateUserInfoCommand;
using Edunary.Application.Users.Queries.GetAdminUserDetailQuery;
using Edunary.Application.Users.Queries.GetAdminUsersWithPaginationQuery;
using Edunary.Application.Users.Queries.GetAdminUserStatusCountsQuery;
using Edunary.Application.Users.Queries.GetAdminOverviewSummaryQuery;
using Edunary.Application.Users.Queries.GetRegistrationTrendQuery;
using Edunary.Application.Users.Queries.GetNewVsReturningQuery;
using Edunary.Application.Users.Queries.GetBasicUserInfoQuery;
using Edunary.Application.Users.Queries.GetPublicUserInfoQuery;
using Edunary.Application.Users.Queries.GetTopInstructorsQuery;
using Edunary.Domain.Constants;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using Edunary.Domain.Common;

namespace Edunary.Web.Endpoints;

public class User : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(Create, "create")
            .MapPut(UpdateUserInfo)
            .MapPut(UpdatePayoutAccount, "payout-account")
            .MapPut(UpdateUserAvatar, "avatar")
            .MapGet(GetBasicInfo, "basic-info")
            .MapPost(ChangePassword, "change-password");

        app.MapGroup(this)
            .MapGet(GetPublicUserInfo)
            .MapGet(GetTopInstructors, "top-instructors");

        app.MapGroup(this)
            .RequireAuthorization(Policies.SuperAdmin)
            .MapGet(AdminGetUsers, "admin")
            .MapGet(AdminGetUserStatusCounts, "admin/status-counts")
            .MapGet(AdminGetUserDetail, "admin/{userId}")
            .MapGet(AdminGetOverviewSummary, "admin/overview/summary")
            .MapGet(AdminGetRegistrationTrend, "admin/overview/registration-trend")
            .MapGet(AdminGetNewVsReturning, "admin/overview/new-vs-returning")
            .MapPut(AdminRestrictUser, "admin/restrict")
            .MapPut(AdminUnbanUser, "admin/unban")
            .MapPut(AdminChangeUserRole, "admin/change-role")
            .MapPost(AdminCreateUser, "admin/create-user");
    }

    public async Task<IResult> Create(ISender sender, CreateUserCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
            return Results.BadRequest(result);
        return Results.Ok(result);
    }

    public async Task<IResult> UpdateUserInfo(ISender sender, UpdateUserInfoCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
            return Results.BadRequest(result);
        return Results.Ok(result);
    }

    public async Task<IResult> UpdatePayoutAccount(ISender sender, UpdatePayoutAccountCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
    public async Task<IResult> UpdateUserAvatar(ISender sender, UpdateUserAvatarCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
            return Results.BadRequest(result);
        return Results.Ok(result);
    }

    public async Task<UserVm> GetBasicInfo(ISender sender)
    {
        return await sender.Send(new GetBasicUserInfoQuery());
    }

    public async Task<IResult> ChangePassword(ISender sender, ChangePasswordCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
            return Results.BadRequest(result);
        return Results.Ok(result);
    }

    public async Task<PublicProfileDto> GetPublicUserInfo(ISender sender, [AsParameters] GetPublicUserInfoQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<List<TopInstructorDto>> GetTopInstructors(ISender sender, [AsParameters] GetTopInstructorsQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<PaginatedList<AdminUserListItemDto>> AdminGetUsers(ISender sender, [AsParameters] GetAdminUsersWithPaginationQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<AdminUserStatusCountsDto> AdminGetUserStatusCounts(ISender sender)
    {
        return await sender.Send(new GetAdminUserStatusCountsQuery());
    }

    public async Task<AdminUserDetailDto> AdminGetUserDetail(ISender sender, [AsParameters] GetAdminUserDetailQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<Result> AdminRestrictUser(ISender sender, [FromBody] RestrictUserCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result> AdminUnbanUser(ISender sender, [FromBody] UnbanUserCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result> AdminChangeUserRole(ISender sender, [FromBody] ChangeUserRoleCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<AdminOverviewSummaryDto> AdminGetOverviewSummary(ISender sender)
    {
        return await sender.Send(new GetAdminOverviewSummaryQuery());
    }

    public async Task<RegistrationTrendDto> AdminGetRegistrationTrend(
        ISender sender, [AsParameters] GetRegistrationTrendQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<NewVsReturningDto> AdminGetNewVsReturning(
        ISender sender, [AsParameters] GetNewVsReturningQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<IResult> AdminCreateUser(ISender sender, [FromBody] AuthenticateModel model)
    {
        var result = await sender.Send(new CreateUserCommand()
        {
            UserName = model.Email,
            PhoneNumber = model.PhoneNumber!,
            Email = model.Email,
            Password = model.Password!,
            FullName = model.FullName!
        });
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
}
