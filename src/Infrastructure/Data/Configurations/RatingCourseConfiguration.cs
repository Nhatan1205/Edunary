using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class RatingCourseConfiguration : IEntityTypeConfiguration<RatingCourse>
{
    public void Configure(EntityTypeBuilder<RatingCourse> builder)
    {
        builder.Property(e => e.CourseId)
            .IsRequired();

        builder.Property(e => e.UserId)
            .IsRequired();

        builder.Property(e => e.Rating)
            .IsRequired();

        builder.Property(e => e.Review)
            .HasMaxLength(500);

        builder.HasIndex(e => new { e.CourseId, e.UserId })
            .IsUnique()
            .HasDatabaseName("IX_RatingCourses_CourseId_UserId");
    }
}
