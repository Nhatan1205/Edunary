using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class QuizConfiguration : IEntityTypeConfiguration<Quiz>
{
    public void Configure(EntityTypeBuilder<Quiz> builder)
    {
        builder.HasKey(q => q.Id);

        builder.Property(q => q.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(q => q.Description)
            .HasMaxLength(2000);

        builder.Property(q => q.ItemId)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(q => new { q.CourseId, q.ItemId }).IsUnique();

        builder.HasOne(q => q.Course)
            .WithMany()
            .HasForeignKey(q => q.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(q => q.Questions)
            .WithOne(q => q.Quiz)
            .HasForeignKey(q => q.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(q => q.Snapshots)
            .WithOne(s => s.Quiz)
            .HasForeignKey(s => s.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(q => q.Attempts)
            .WithOne(a => a.Quiz)
            .HasForeignKey(a => a.QuizId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
