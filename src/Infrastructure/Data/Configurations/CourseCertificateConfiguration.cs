using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class CourseCertificateConfiguration : IEntityTypeConfiguration<CourseCertificate>
{
    public void Configure(EntityTypeBuilder<CourseCertificate> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.CertificateNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.StudentId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(c => c.CourseTitleSnapshot)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(c => c.InstructorNameSnapshot)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(c => c.StudentNameSnapshot)
            .IsRequired()
            .HasMaxLength(256);

        // Unique index for CertificateNumber
        builder.HasIndex(c => c.CertificateNumber)
            .IsUnique();

        // One certificate per student per course
        builder.HasIndex(c => new { c.CourseId, c.StudentId })
            .IsUnique();

        builder.HasOne(c => c.Course)
            .WithMany()
            .HasForeignKey(c => c.CourseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
