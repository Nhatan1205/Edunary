using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class ChoiceConfiguration : IEntityTypeConfiguration<Choice>
{
    public void Configure(EntityTypeBuilder<Choice> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Text)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasOne(c => c.Question)
            .WithMany(q => q.Choices)
            .HasForeignKey(c => c.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
