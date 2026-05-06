using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class QuizAttemptAnswerConfiguration : IEntityTypeConfiguration<QuizAttemptAnswer>
{
    public void Configure(EntityTypeBuilder<QuizAttemptAnswer> builder)
    {
        builder.HasKey(a => a.Id);

        builder.HasIndex(a => a.QuizAttemptId);

        builder.HasOne(a => a.QuizAttempt)
            .WithMany(qa => qa.Answers)
            .HasForeignKey(a => a.QuizAttemptId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(a => a.AnswerChoices)
            .WithOne(ac => ac.QuizAttemptAnswer)
            .HasForeignKey(ac => ac.QuizAttemptAnswerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
