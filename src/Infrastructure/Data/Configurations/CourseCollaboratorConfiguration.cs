using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class CourseCollaboratorConfiguration : IEntityTypeConfiguration<CourseCollaborator>
{
    public void Configure(EntityTypeBuilder<CourseCollaborator> builder)
    {
        builder.HasKey(c => c.Id);

        builder.HasIndex(c => new { c.CourseId, c.UserId })
            .IsUnique();

        builder.Property(c => c.UserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(c => c.Permissions)
            .HasConversion<int>();

        builder.Property(c => c.InviteStatus)
            .HasConversion<int>();

        builder.Property(c => c.RevenueSharePercent)
            .HasColumnType("decimal(5,2)")
            .HasDefaultValue(0m);

        builder.HasOne(c => c.Course)
            .WithMany(course => course.Collaborators)
            .HasForeignKey(c => c.CourseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
