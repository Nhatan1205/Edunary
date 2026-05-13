using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class RevenueSharePlanConfiguration : IEntityTypeConfiguration<RevenueSharePlan>
{
    public void Configure(EntityTypeBuilder<RevenueSharePlan> builder)
    {
        builder.Property(p => p.InstructorPercentage).HasPrecision(6, 4).IsRequired();
        builder.HasIndex(p => new { p.Channel, p.IsActive });
    }
}
