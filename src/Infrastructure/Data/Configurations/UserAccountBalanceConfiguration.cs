using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class UserAccountBalanceConfiguration : IEntityTypeConfiguration<UserAccountBalance>
{
    public void Configure(EntityTypeBuilder<UserAccountBalance> builder)
    {
        builder.HasKey(b => new { b.UserId, b.AccountCode, b.Currency });

        builder.Property(b => b.UserId)
            .HasMaxLength(450)
            .IsRequired();

        builder.Property(b => b.AccountCode)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(b => b.Currency)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(b => b.Balance)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.HasIndex(b => b.UserId);
    }
}
