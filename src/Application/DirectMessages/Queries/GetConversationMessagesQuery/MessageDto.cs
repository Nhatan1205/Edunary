using Edunary.Domain.Entities;

namespace Edunary.Application.DirectMessages.Queries.GetConversationMessagesQuery;

public class MessageDto
{
    public int Id { get; set; }
    public int ConversationId { get; set; }
    public string SenderId { get; set; }
    public string SenderName { get; set; }
    public string SenderAvatar { get; set; }
    public string Content { get; set; }
    public bool IsRead { get; set; }
    public DateTimeOffset Created { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Message, MessageDto>()
                .ForMember(d => d.SenderName, opt => opt.Ignore())
                .ForMember(d => d.SenderAvatar, opt => opt.Ignore());
        }
    }
}
