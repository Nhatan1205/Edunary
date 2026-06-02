using Edunary.Application.Common.Models;
using Edunary.Application.DirectMessages.Queries.GetConversationMessagesQuery;
using Edunary.Domain.Entities;

namespace Edunary.Application.DirectMessages.Queries.GetConversationsQuery;
public class ConversationDto
{
    public int Id { get; set; }
    public string ParticipantOneId { get; set; }
    public string ParticipantTwoId { get; set; }
    public DateTimeOffset LastMessageAt { get; set; }
    public int? LastMessageId { get; set; }
    public bool IsBlocked { get; set; }
    public bool IsImportant { get; set; }
    public bool IsMarkedUnread { get; set; }
    public DateTimeOffset Created { get; set; }
    public string CreatedBy { get; set; }
    public string LastModifiedBy { get; set; }

    public MessageDto LastMessage { get; set; }
    public UserIdentityDto Recipient { get; set; }
    public int UnreadCount { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Conversation, ConversationDto>()
                .ForMember(d => d.Recipient, opt => opt.Ignore())
                .ForMember(d => d.UnreadCount, opt => opt.Ignore());
        }
    }
}
