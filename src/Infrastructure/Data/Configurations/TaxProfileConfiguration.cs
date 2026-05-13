using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class TaxProfileConfiguration : IEntityTypeConfiguration<TaxProfile>
{
    public void Configure(EntityTypeBuilder<TaxProfile> builder)
    {
        builder.HasKey(p => p.InstructorId);
        builder.Property(p => p.InstructorId).HasMaxLength(450).IsRequired();
        builder.Property(p => p.TaxCountryCode).HasMaxLength(2);
        builder.Property(p => p.WithholdingRate).HasPrecision(6, 4).IsRequired();
    }
}
