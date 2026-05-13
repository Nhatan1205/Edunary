using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class TaxRegionConfiguration : IEntityTypeConfiguration<TaxRegion>
{
    public void Configure(EntityTypeBuilder<TaxRegion> builder)
    {
        builder.HasKey(r => r.CountryCode);
        builder.Property(r => r.CountryCode).HasMaxLength(2).IsRequired();
        builder.Property(r => r.CountryName).HasMaxLength(100).IsRequired();
        builder.Property(r => r.VatRate).HasPrecision(6, 4).IsRequired();
    }
}
