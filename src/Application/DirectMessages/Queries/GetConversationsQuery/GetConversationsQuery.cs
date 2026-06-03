using System;
using System.Collections.Generic;
using System.Linq;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;


namespace Edunary.Application.DirectMessages.Queries.GetConversationsQuery;

public class GetConversationsQuery : IRequest<PaginatedList<ConversationDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string Filter { get; set; }
    public string SortBy { get; set; }
    public string SearchText { get; set; }
}

public class GetConversationsQueryHandler : IRequestHandler<GetConversationsQuery, PaginatedList<ConversationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;
    private readonly IMapper _mapper;
    private readonly IConnectionManagerService _connectionManager;

    public GetConversationsQueryHandler(
        IApplicationDbContext context,
        IUser currentUser,
        IIdentityService identityService,
        IMapper mapper,
        IConnectionManagerService connectionManager)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
        _mapper = mapper;
        _connectionManager = connectionManager;
    }

    public async Task<PaginatedList<ConversationDto>> Handle(GetConversationsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id;
        if (string.IsNullOrEmpty(currentUserId))
        {
            return new PaginatedList<ConversationDto>(new List<ConversationDto>(), 0, request.PageNumber, request.PageSize);
        }

        var query = _context.Conversations
            .Include(c => c.LastMessage)
            .Where(c => c.ParticipantOneId == currentUserId || c.ParticipantTwoId == currentUserId);

        // Search text handling via cross-layer identity service
        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var matchingUserIds = await _identityService.SearchUserIdsByKeywordAsync(request.SearchText, cancellationToken);
            if (!matchingUserIds.Any())
            {
                return new PaginatedList<ConversationDto>(new List<ConversationDto>(), 0, request.PageNumber, request.PageSize);
            }

            query = query.Where(c =>
                (c.ParticipantOneId != currentUserId && matchingUserIds.Contains(c.ParticipantOneId)) ||
                (c.ParticipantTwoId != currentUserId && matchingUserIds.Contains(c.ParticipantTwoId)));
        }

        // Apply filters (Generic actions using per-user settings)
        if (!string.IsNullOrEmpty(request.Filter))
        {
            if (request.Filter.Equals("unread", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => 
                    c.UserSettings.Any(s => s.UserId == currentUserId && s.IsMarkedUnread) || 
                    c.Messages.Any(m => m.SenderId != currentUserId && !m.IsRead));
            }
            else if (request.Filter.Equals("important", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.UserSettings.Any(s => s.UserId == currentUserId && s.IsImportant));
            }
            else if (request.Filter.Equals("not_answered", StringComparison.OrdinalIgnoreCase))
            {
                // Unanswered: Last message exists and was sent by the other participant
                query = query.Where(c => 
                    c.LastMessage != null && 
                    c.LastMessage.SenderId != currentUserId);
            }
        }

        // Apply sorting (prioritize important conversations first)
        var sortedQuery = query.OrderByDescending(c => c.UserSettings.Any(s => s.UserId == currentUserId && s.IsImportant));

        if (!string.IsNullOrEmpty(request.SortBy) && request.SortBy.Equals("oldest", StringComparison.OrdinalIgnoreCase))
        {
            query = sortedQuery.ThenBy(c => c.LastMessageAt);
        }
        else
        {
            query = sortedQuery.ThenByDescending(c => c.LastMessageAt);
        }

        // Paginate conversations
        var paginatedList = await query
            .ProjectTo<ConversationDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        if (!paginatedList.Items.Any())
        {
            return paginatedList;
        }

        // Batch fetch all recipient details in a single query
        var recipientIds = paginatedList.Items
            .Select(c => c.ParticipantOneId == currentUserId ? c.ParticipantTwoId : c.ParticipantOneId)
            .Distinct()
            .ToList();

        var recipientProfiles = await _identityService.GetUserIdentitiesByIdsAsync(recipientIds, cancellationToken);
        
        bool[] onlineResults = await Task.WhenAll(
            recipientIds.Select(id => _connectionManager.IsConnectedAsync(id)));

        var onlineMap = recipientIds
            .Zip(onlineResults, (id, isOnline) => (id, isOnline))
            .ToDictionary(x => x.id, x => x.isOnline);

        var profileDict = recipientProfiles.ToDictionary(p => p.Id);

        // Batch fetch unread counts in a single group-by query
        var conversationIds = paginatedList.Items.Select(c => c.Id).ToList();
        var unreadCounts = await _context.Messages
            .Where(m => conversationIds.Contains(m.ConversationId) && m.SenderId != currentUserId && !m.IsRead)
            .GroupBy(m => m.ConversationId)
            .Select(g => new { ConversationId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ConversationId, x => x.Count, cancellationToken);

        // Batch fetch all user settings for current user in this page's conversations
        var userSettingsDict = await _context.ConversationUserSettings
            .Where(s => conversationIds.Contains(s.ConversationId) && s.UserId == currentUserId)
            .ToDictionaryAsync(s => s.ConversationId, cancellationToken);

        // Map recipient profiles, unread counts, and user settings to the items
        foreach (var item in paginatedList.Items)
        {
            var recipientId = item.ParticipantOneId == currentUserId ? item.ParticipantTwoId : item.ParticipantOneId;
            if (profileDict.TryGetValue(recipientId, out var profile))
            {
                profile.Online = onlineMap.GetValueOrDefault(recipientId, false);
                item.Recipient = profile;
            }

            if (unreadCounts.TryGetValue(item.Id, out var unreadCount))
            {
                item.UnreadCount = unreadCount;
            }
            else
            {
                item.UnreadCount = 0;
            }

            // Populate per-user preferences from batch-fetched settings
            if (userSettingsDict.TryGetValue(item.Id, out var userSetting))
            {
                item.IsImportant = userSetting.IsImportant;
                item.IsMarkedUnread = userSetting.IsMarkedUnread;
                if (userSetting.IsMarkedUnread && item.UnreadCount == 0)
                {
                    item.UnreadCount = 1;
                }
            }
            else
            {
                item.IsImportant = false;
                item.IsMarkedUnread = false;
            }

            // Fill Sender Details on LastMessage if available
            if (item.LastMessage != null)
            {
                var senderId = item.LastMessage.SenderId;
                if (profileDict.TryGetValue(senderId, out var senderProfile))
                {
                    item.LastMessage.SenderName = senderProfile.FullName;
                    item.LastMessage.SenderAvatar = senderProfile.Avatar;
                }
                else if (senderId == currentUserId)
                {
                    var currentProfile = await _identityService.GetUserIdentityByIdAsync(currentUserId);
                    item.LastMessage.SenderName = currentProfile?.FullName ?? "You";
                    item.LastMessage.SenderAvatar = currentProfile?.Avatar;
                }
            }
        }

        return paginatedList;
    }
}
