using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class InstructorWalletConfiguration : IEntityTypeConfiguration<InstructorWallet>
{
    public void Configure(EntityTypeBuilder<InstructorWallet> builder)
    {
        builder.Property(x => x.InstructorId)
            .HasMaxLength(450)
            .IsRequired();

        builder.HasIndex(x => x.InstructorId)
            .IsUnique();

        builder.Property(x => x.Balance)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.TotalWithdrawn)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasMany(x => x.Transactions)
            .WithOne(x => x.InstructorWallet)
            .HasForeignKey(x => x.InstructorWalletId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.WithdrawalRequests)
            .WithOne(x => x.InstructorWallet)
            .HasForeignKey(x => x.InstructorWalletId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
