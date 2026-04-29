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

        // JSON fields — no max length constraint
        builder.Property(p => p.KnownSkills).HasColumnType("nvarchar(max)");
        builder.Property(p => p.Interests).HasColumnType("nvarchar(max)");
        builder.Property(p => p.PreferredCategoryIds).HasColumnType("nvarchar(max)");

        // Unique: one profile per student
        builder.HasIndex(p => p.StudentId)
            .IsUnique()
            .HasDatabaseName("IX_LearnerProfiles_StudentId");
    }
}
