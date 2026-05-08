using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class CourseAnswerConfiguration : IEntityTypeConfiguration<CourseAnswer>
{
    public void Configure(EntityTypeBuilder<CourseAnswer> builder)
    {
        builder.Property(a => a.Body)
            .IsRequired()
            .HasMaxLength(8000);

        builder.HasOne(a => a.Question)
            .WithMany(q => q.Answers)
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => new { a.QuestionId, a.Created })
            .HasDatabaseName("IX_CourseAnswers_Question_Created");
    }
}
