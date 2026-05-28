using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class QualityCheckReportConfiguration : IEntityTypeConfiguration<QualityCheckReport>
{
    public void Configure(EntityTypeBuilder<QualityCheckReport> builder)
    {
        builder.HasIndex(r => r.CourseId);

        builder.HasOne(r => r.Course)
            .WithMany(c => c.QualityReports)
            .HasForeignKey(r => r.CourseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
