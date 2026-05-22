using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class CourseReviewSubmissionConfiguration : IEntityTypeConfiguration<CourseReviewSubmission>
{
    public void Configure(EntityTypeBuilder<CourseReviewSubmission> builder)
    {
        builder.HasIndex(s => s.CourseId);
        builder.HasIndex(s => new { s.CourseId, s.Status });

        builder.HasOne(s => s.Course)
            .WithMany(c => c.ReviewSubmissions)
            .HasForeignKey(s => s.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Feedbacks)
            .WithOne(f => f.Submission)
            .HasForeignKey(f => f.CourseReviewSubmissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
