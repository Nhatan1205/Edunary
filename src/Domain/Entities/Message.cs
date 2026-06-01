using System;

namespace Edunary.Domain.Entities;

public class Message : BaseAuditableEntity
{
    public int ConversationId { get; set; }
    public string SenderId { get; set; }
    public string Content { get; set; }
    public bool IsRead { get; set; }

    public Conversation Conversation { get; set; }
}
