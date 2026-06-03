using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.Property(m => m.SenderId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(m => m.Content)
            .IsRequired();

        // Relationship
        builder.HasOne(m => m.Conversation)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Composite index on ConversationId and Id (descending for pagination)
        builder.HasIndex(m => new { m.ConversationId, m.Id })
            .HasDatabaseName("IX_Messages_ConversationId_Id");
    }
}
