using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.Property(c => c.ParticipantOneId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(c => c.ParticipantTwoId)
            .IsRequired()
            .HasMaxLength(450);

        // Unique index to prevent duplicate conversations between two participants
        builder.HasIndex(c => new { c.ParticipantOneId, c.ParticipantTwoId })
            .IsUnique()
            .HasDatabaseName("IX_Conversations_ParticipantOneId_ParticipantTwoId");

        // Index on LastMessageAt for fast sorting
        builder.HasIndex(c => c.LastMessageAt)
            .HasDatabaseName("IX_Conversations_LastMessageAt");

        // Relationship to the last message (avoiding cascade loops)
        builder.HasOne(c => c.LastMessage)
            .WithMany()
            .HasForeignKey(c => c.LastMessageId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
