using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class AssignmentQuestionConfiguration : IEntityTypeConfiguration<AssignmentQuestion>
{
    public void Configure(EntityTypeBuilder<AssignmentQuestion> builder)
    {
        builder.HasKey(q => q.Id);

        builder.Property(q => q.QuestionText)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(q => q.ExampleAnswer)
            .HasMaxLength(5000);

        builder.HasOne(q => q.Assignment)
            .WithMany(a => a.Questions)
            .HasForeignKey(q => q.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
