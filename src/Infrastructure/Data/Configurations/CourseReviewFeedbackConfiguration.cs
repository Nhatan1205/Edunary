using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class CourseReviewFeedbackConfiguration : IEntityTypeConfiguration<CourseReviewFeedback>
{
    public void Configure(EntityTypeBuilder<CourseReviewFeedback> builder)
    {
        builder.Property(f => f.Content)
            .IsRequired()
            .HasMaxLength(4000);

        builder.HasIndex(f => f.CourseReviewSubmissionId);

        builder.HasOne(f => f.Submission)
            .WithMany(s => s.Feedbacks)
            .HasForeignKey(f => f.CourseReviewSubmissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
