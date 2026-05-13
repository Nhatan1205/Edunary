using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class FinancialEntryConfiguration : IEntityTypeConfiguration<FinancialEntry>
{
    public void Configure(EntityTypeBuilder<FinancialEntry> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.AccountCode)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.Side)
            .HasConversion<string>()
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(e => e.Amount)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.UserId)
            .HasMaxLength(450);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.HasOne(e => e.Account)
            .WithMany()
            .HasForeignKey(e => e.AccountCode)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.TransactionId);
        builder.HasIndex(e => new { e.AccountCode, e.UserId });
    }
}
