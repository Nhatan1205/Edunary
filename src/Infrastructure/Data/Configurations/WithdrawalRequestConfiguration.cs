using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class WithdrawalRequestConfiguration : IEntityTypeConfiguration<WithdrawalRequest>
{
    public void Configure(EntityTypeBuilder<WithdrawalRequest> builder)
    {
        builder.Property(x => x.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.WithholdingRate)
            .HasPrecision(6, 4)
            .IsRequired();

        builder.Property(x => x.WithholdingAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.NetAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.TaxCountryCode)
            .HasMaxLength(2);

        builder.Property(x => x.Currency)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.Bank)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.BankNumber)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.BankAccountHolder)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.HasIndex(x => new { x.InstructorWalletId, x.Status });
    }
}
