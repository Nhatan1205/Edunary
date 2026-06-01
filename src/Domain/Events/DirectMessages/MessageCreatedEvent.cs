using Edunary.Domain.Entities;

namespace Edunary.Domain.Events;

public class MessageCreatedEvent : BaseEvent
{
    public MessageCreatedEvent(Message message)
    {
        Message = message;
    }

    public Message Message { get; }
}
