using System.Threading.Tasks;
using Edunary.Application.Common.Models;
using Edunary.Application.DirectMessages.Commands.CreateConversationCommand;
using Edunary.Application.DirectMessages.Commands.SendMessageCommand;
using Edunary.Application.DirectMessages.Commands.ToggleConversationReadCommand;
using Edunary.Application.DirectMessages.Commands.ToggleConversationImportantCommand;
using Edunary.Application.DirectMessages.Commands.ToggleConversationBlockCommand;
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
            .MapPut(ToggleConversationRead, "conversations/read")
            .MapPut(ToggleConversationImportant, "conversations/important")
            .MapPut(ToggleConversationBlock, "conversations/block");
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

    public async Task<CursorPaginatedList<MessageDto>> GetConversationMessages(ISender sender, [AsParameters] GetConversationMessagesQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<List<UserIdentityDto>> SearchUsers(ISender sender, [AsParameters] SearchMessageableUsersQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<IResult> ToggleConversationRead(ISender sender, [FromBody] ToggleConversationReadCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> ToggleConversationImportant(ISender sender, [FromBody] ToggleConversationImportantCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> ToggleConversationBlock(ISender sender, [FromBody] ToggleConversationBlockCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
}
