using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class QuizAttemptAnswerChoiceConfiguration : IEntityTypeConfiguration<QuizAttemptAnswerChoice>
{
    public void Configure(EntityTypeBuilder<QuizAttemptAnswerChoice> builder)
    {
        builder.HasKey(ac => ac.Id);

        builder.HasIndex(ac => ac.QuizAttemptAnswerId);

        builder.HasOne(ac => ac.QuizAttemptAnswer)
            .WithMany(a => a.AnswerChoices)
            .HasForeignKey(ac => ac.QuizAttemptAnswerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
