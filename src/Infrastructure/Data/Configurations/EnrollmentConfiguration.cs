using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.Property(e => e.CourseId)
            .IsRequired();

        builder.Property(e => e.StudentId)
            .IsRequired()
            .HasMaxLength(450);

        // Configure relationships
        builder.HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Create composite unique index to prevent duplicate enrollments
        builder.HasIndex(e => new { e.CourseId, e.StudentId })
            .IsUnique()
            .HasDatabaseName("IX_Enrollments_CourseId_StudentId");
    }
}