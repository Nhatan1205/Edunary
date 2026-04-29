using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class TopicConfiguration : IEntityTypeConfiguration<Topic>
{
    public void Configure(EntityTypeBuilder<Topic> builder)
    {
        builder.Property(t => t.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasMany(t => t.Courses)
            .WithMany(c => c.Topics)
            .UsingEntity("CourseTopic");
    }
}
