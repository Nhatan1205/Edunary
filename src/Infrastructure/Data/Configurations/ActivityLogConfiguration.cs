using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class ActivityLogConfiguration : IEntityTypeConfiguration<ActivityLog>
{
    public void Configure(EntityTypeBuilder<ActivityLog> builder)
    {
        builder.Property(l => l.UserId)
            .HasMaxLength(450);
        builder.Property(l => l.Description)
            .HasMaxLength(500);
        builder.Property(l => l.ActivityType)
            .HasConversion<int>();
        builder.HasIndex(l => l.UserId)
            .HasDatabaseName("IX_ActivityLogs_UserId");

        builder.HasIndex(l => l.Created)
            .HasDatabaseName("IX_ActivityLogs_Created");

        builder.HasIndex(l => l.ActivityType)
            .HasDatabaseName("IX_ActivityLogs_ActivityType");
    }
}
