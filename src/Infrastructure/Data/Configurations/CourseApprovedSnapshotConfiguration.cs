using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class CourseApprovedSnapshotConfiguration : IEntityTypeConfiguration<CourseApprovedSnapshot>
{
    public void Configure(EntityTypeBuilder<CourseApprovedSnapshot> builder)
    {
        builder.HasIndex(s => s.CourseId);

        builder.HasOne(s => s.Course)
            .WithMany(c => c.ApprovedSnapshots)
            .HasForeignKey(s => s.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Submission)
            .WithMany()
            .HasForeignKey(s => s.CourseReviewSubmissionId)
            .OnDelete(DeleteBehavior.NoAction);   // Submission already cascades from Course
    }
}
