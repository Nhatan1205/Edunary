using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class AssignmentSubmissionConfiguration : IEntityTypeConfiguration<AssignmentSubmission>
{
    public void Configure(EntityTypeBuilder<AssignmentSubmission> builder)
    {
        builder.HasKey(s => s.Id);

        // One submission per student per assignment
        builder.HasIndex(s => new { s.AssignmentId, s.StudentId }).IsUnique();

        builder.Property(s => s.Answers)
            .HasColumnType("nvarchar(max)");

        builder.Property(s => s.Status)
            .HasConversion<int>();

        builder.HasOne(s => s.Assignment)
            .WithMany(a => a.Submissions)
            .HasForeignKey(s => s.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Feedbacks)
            .WithOne(f => f.AssignmentSubmission)
            .HasForeignKey(f => f.AssignmentSubmissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
