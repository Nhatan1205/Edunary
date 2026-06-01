using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Application.DirectMessages.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.DirectMessages.Queries.GetConversationMessagesQuery;

public class GetConversationMessagesQuery : IRequest<CursorPaginatedList<MessageDto>>
{
    public int ConversationId { get; set; }
    public int? Cursor { get; set; }
    public int PageSize { get; set; } = 20;
}

public class GetConversationMessagesQueryHandler : IRequestHandler<GetConversationMessagesQuery, CursorPaginatedList<MessageDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;
    private readonly IMapper _mapper;

    public GetConversationMessagesQueryHandler(
        IApplicationDbContext context,
        IUser currentUser,
        IIdentityService identityService,
        IMapper mapper)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
        _mapper = mapper;
    }

    public async Task<CursorPaginatedList<MessageDto>> Handle(GetConversationMessagesQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id;
        if (string.IsNullOrEmpty(currentUserId))
        {
            return new CursorPaginatedList<MessageDto>(new List<MessageDto>(), false);
        }

        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.Id == request.ConversationId, cancellationToken);

        if (conversation == null)
        {
            return new CursorPaginatedList<MessageDto>(new List<MessageDto>(), false);
        }

        // Verify participant authorization
        if (conversation.ParticipantOneId != currentUserId && conversation.ParticipantTwoId != currentUserId)
        {
            return new CursorPaginatedList<MessageDto>(new List<MessageDto>(), false);
        }

        // Direct ordering of messages (descending so we get latest first)
        var query = _context.Messages
            .Where(m => m.ConversationId == request.ConversationId)
            .OrderByDescending(m => m.Id)
            .ProjectTo<MessageDto>(_mapper.ConfigurationProvider);

        // Apply cursor-based predicate (e.g. earlier messages have smaller IDs)
        Expression<Func<MessageDto, bool>> cursorPredicate = request.Cursor.HasValue
            ? m => m.Id < request.Cursor.Value
            : null;

        var paginatedList = await query.CursorPaginatedListAsync(cursorPredicate, request.PageSize);

        if (!paginatedList.Items.Any())
        {
            return paginatedList;
        }

        // Batch fetch sender profile info
        var senderIds = paginatedList.Items.Select(m => m.SenderId).Distinct().ToList();
        var senderProfiles = await _identityService.GetUserIdentitiesByIdsAsync(senderIds, cancellationToken);
        var profileDict = senderProfiles.ToDictionary(p => p.Id);

        foreach (var message in paginatedList.Items)
        {
            if (profileDict.TryGetValue(message.SenderId, out var profile))
            {
                message.SenderName = profile.FullName;
                message.SenderAvatar = profile.Avatar;
            }
        }

        return paginatedList;
    }
}
