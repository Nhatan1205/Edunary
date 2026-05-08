using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class CourseQuestionConfiguration : IEntityTypeConfiguration<CourseQuestion>
{
    public void Configure(EntityTypeBuilder<CourseQuestion> builder)
    {
        builder.Property(q => q.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(q => q.ItemId)
            .HasMaxLength(100);

        builder.Property(q => q.Detail)
            .HasMaxLength(8000);

        builder.HasOne(q => q.Course)
            .WithMany(c => c.CourseQuestions)
            .HasForeignKey(q => q.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(q => new { q.CourseId, q.Created })
            .HasDatabaseName("IX_CourseQuestions_Course_Created");

        builder.HasIndex(q => new { q.CourseId, q.ItemId })
            .HasDatabaseName("IX_CourseQuestions_Course_Item");
    }
}
