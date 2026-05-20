using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

// EF Core configuration for RatingResponse entity
public class RatingResponseConfiguration : IEntityTypeConfiguration<RatingResponse>
{
    public void Configure(EntityTypeBuilder<RatingResponse> builder)
    {
        builder.Property(e => e.RatingCourseId)
            .IsRequired();

        builder.Property(e => e.ResponseText)
            .IsRequired();

        // Configure 1-to-1 relationship with RatingCourse
        builder.HasOne(r => r.RatingCourse)
            .WithOne(rc => rc.RatingResponse)
            .HasForeignKey<RatingResponse>(r => r.RatingCourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Ensure unique relationship constraint
        builder.HasIndex(r => r.RatingCourseId)
            .IsUnique()
            .HasDatabaseName("IX_RatingResponses_RatingCourseId");
    }
}
