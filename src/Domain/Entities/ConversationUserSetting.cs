using System;

namespace Edunary.Domain.Entities;

public class ConversationUserSetting : BaseAuditableEntity
{
    public int ConversationId { get; set; }
    public string UserId { get; set; }
    public bool IsMarkedUnread { get; set; }
    public bool IsImportant { get; set; }

    public Conversation Conversation { get; set; }
}
