using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;
public class RoadmapConfiguration : IEntityTypeConfiguration<Roadmap>
{
    public void Configure(EntityTypeBuilder<Roadmap> builder)
    {
        builder.Property(x => x.Title)
            .IsRequired();

        builder.Property(x => x.IsPublic)
            .HasDefaultValue(false);

        builder.HasOne(x => x.RoadmapTopic)
            .WithMany(x => x.Roadmaps)
            .HasForeignKey(x => x.RoadmapTopicId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
