using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;
public class LearnerProfileConfiguration : IEntityTypeConfiguration<LearnerProfile>
{
    public void Configure(EntityTypeBuilder<LearnerProfile> builder)
    {
        builder.Property(p => p.StudentId)
            .IsRequired()
            .HasMaxLength(450);
        builder.Property(p => p.Goal)
            .HasMaxLength(200);
        builder.Property(p => p.SkillLevel)
            .HasMaxLength(50);
        builder.Property(p => p.PreferredCategoryIds).HasColumnType("nvarchar(max)");
        builder.HasIndex(p => p.StudentId)
            .IsUnique()
            .HasDatabaseName("IX_LearnerProfiles_StudentId");
    }
}
