using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class QuizAttemptSnapshotConfiguration : IEntityTypeConfiguration<QuizAttemptSnapshot>
{
    public void Configure(EntityTypeBuilder<QuizAttemptSnapshot> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.QuizQuestions)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        builder.HasIndex(s => s.QuizId);

        builder.HasOne(s => s.Quiz)
            .WithMany(q => q.Snapshots)
            .HasForeignKey(s => s.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Attempts)
            .WithOne(a => a.Snapshot)
            .HasForeignKey(a => a.QuizAttemptSnapshotId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
