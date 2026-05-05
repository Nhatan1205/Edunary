using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class QuizAttemptConfiguration : IEntityTypeConfiguration<QuizAttempt>
{
    public void Configure(EntityTypeBuilder<QuizAttempt> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.UserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.HasIndex(a => new { a.QuizId, a.UserId });
        builder.HasIndex(a => new { a.UserId, a.IsActive });

        builder.HasOne(a => a.Quiz)
            .WithMany(q => q.Attempts)
            .HasForeignKey(a => a.QuizId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(a => a.Snapshot)
            .WithMany(s => s.Attempts)
            .HasForeignKey(a => a.QuizAttemptSnapshotId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasMany(a => a.Answers)
            .WithOne(ans => ans.QuizAttempt)
            .HasForeignKey(ans => ans.QuizAttemptId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
