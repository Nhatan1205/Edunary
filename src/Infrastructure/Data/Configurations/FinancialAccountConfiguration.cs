using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class FinancialAccountConfiguration : IEntityTypeConfiguration<FinancialAccount>
{
    public void Configure(EntityTypeBuilder<FinancialAccount> builder)
    {
        builder.HasKey(a => a.AccountCode);

        builder.Property(a => a.AccountCode)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(a => a.AccountName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(a => a.Kind)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();
    }
}
