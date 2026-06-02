using System.Threading.Tasks;
using Edunary.Application.Common.Models;
using Edunary.Application.DirectMessages.Commands.CreateConversationCommand;
using Edunary.Application.DirectMessages.Commands.SendMessageCommand;
using Edunary.Application.DirectMessages.Commands.MarkConversationReadCommand;
using Edunary.Application.DirectMessages.Commands.ToggleConversationSettingCommand;
using Edunary.Application.DirectMessages.Commands.BlockConversationCommand;
using Edunary.Application.DirectMessages.Commands.UnblockConversationCommand;
using Edunary.Application.DirectMessages.Queries;
using Edunary.Application.DirectMessages.Queries.GetConversationMessagesQuery;
using Edunary.Application.DirectMessages.Queries.GetConversationsQuery;
using Edunary.Application.DirectMessages.Queries.SearchMessageableUsersQuery;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Edunary.Web.Endpoints;

public class DirectMessages : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(CreateConversation, "conversations")
            .MapPost(SendMessage, "conversations/{conversationId}/messages")
            .MapGet(GetConversations, "conversations")
            .MapGet(GetConversationMessages, "conversations/{conversationId}/messages")
            .MapGet(SearchUsers, "search-users")
            .MapPut(MarkConversationRead, "conversations/{conversationId}/read")
            .MapPut(ToggleConversationSetting, "conversations/{conversationId}/settings")
            .MapPut(BlockConversation, "conversations/{conversationId}/block")
            .MapPut(UnblockConversation, "conversations/{conversationId}/unblock");
    }

    public async Task<ReturnResult<int>> CreateConversation(ISender sender, CreateConversationCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<IResult> SendMessage(ISender sender, int conversationId, [FromBody] SendMessageCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<PaginatedList<ConversationDto>> GetConversations(ISender sender, [AsParameters] GetConversationsQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<CursorPaginatedList<MessageDto>> GetConversationMessages(ISender sender, int conversationId, [AsParameters] GetConversationMessagesQuery query)
    {
        query.ConversationId = conversationId;
        return await sender.Send(query);
    }

    public async Task<List<UserIdentityDto>> SearchUsers(ISender sender, [AsParameters] SearchMessageableUsersQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<IResult> MarkConversationRead(ISender sender, int conversationId)
    {
        var result = await sender.Send(new MarkConversationReadCommand { ConversationId = conversationId });
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> ToggleConversationSetting(ISender sender, int conversationId, [FromBody] ToggleConversationSettingCommand command)
    {
        command.ConversationId = conversationId;
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> BlockConversation(ISender sender, int conversationId)
    {
        var result = await sender.Send(new BlockConversationCommand { ConversationId = conversationId });
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> UnblockConversation(ISender sender, int conversationId)
    {
        var result = await sender.Send(new UnblockConversationCommand { ConversationId = conversationId });
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
}
