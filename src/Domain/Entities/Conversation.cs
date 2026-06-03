using System;
using System.Collections.Generic;

namespace Edunary.Domain.Entities;

public class Conversation : BaseAuditableEntity
{
    public string ParticipantOneId { get; set; }
    public string ParticipantTwoId { get; set; }
    public DateTimeOffset LastMessageAt { get; set; }
    public int? LastMessageId { get; set; }
    public bool IsBlocked { get; set; }

    public Message LastMessage { get; set; }
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    public ICollection<ConversationUserSetting> UserSettings { get; set; } = new List<ConversationUserSetting>();
}

