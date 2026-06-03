using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class ConversationUserSettingConfiguration : IEntityTypeConfiguration<ConversationUserSetting>
{
    public void Configure(EntityTypeBuilder<ConversationUserSetting> builder)
    {
        builder.Property(s => s.UserId)
            .IsRequired()
            .HasMaxLength(450);

        // Unique setting record per user per conversation
        builder.HasIndex(s => new { s.ConversationId, s.UserId })
            .IsUnique()
            .HasDatabaseName("IX_ConversationUserSettings_ConversationId_UserId");

        builder.HasOne(s => s.Conversation)
            .WithMany(c => c.UserSettings)
            .HasForeignKey(s => s.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
