using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class CourseTopicConfiguration : IEntityTypeConfiguration<CourseTopic>
{
    public void Configure(EntityTypeBuilder<CourseTopic> builder)
    {
        builder.Property(t => t.Name)
            .HasMaxLength(100)
            .IsRequired();

        // N:N join table: CourseCourseTopic
        builder.HasMany(t => t.Courses)
            .WithMany(c => c.Topics)
            .UsingEntity("CourseCourseTopic");
    }
}
