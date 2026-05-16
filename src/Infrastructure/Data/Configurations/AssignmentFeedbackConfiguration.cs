using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class AssignmentFeedbackConfiguration : IEntityTypeConfiguration<AssignmentFeedback>
{
    public void Configure(EntityTypeBuilder<AssignmentFeedback> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Content)
            .IsRequired()
            .HasMaxLength(5000);

        builder.HasOne(f => f.AssignmentSubmission)
            .WithMany(s => s.Feedbacks)
            .HasForeignKey(f => f.AssignmentSubmissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
