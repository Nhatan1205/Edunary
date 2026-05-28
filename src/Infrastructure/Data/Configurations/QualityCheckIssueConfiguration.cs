using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class QualityCheckIssueConfiguration : IEntityTypeConfiguration<QualityCheckIssue>
{
    public void Configure(EntityTypeBuilder<QualityCheckIssue> builder)
    {
        builder.HasIndex(i => i.ReportId);
        builder.HasIndex(i => new { i.ReportId, i.Category });

        builder.HasOne(i => i.Report)
            .WithMany(r => r.Issues)
            .HasForeignKey(i => i.ReportId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(i => i.RuleId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.Location)
            .HasMaxLength(250);

        builder.Property(i => i.Description)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(i => i.Evidence)
            .HasMaxLength(2000);

        builder.Property(i => i.Suggestion)
            .HasMaxLength(2000);
    }
}
