using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class FinancialTransactionConfiguration : IEntityTypeConfiguration<FinancialTransaction>
{
    public void Configure(EntityTypeBuilder<FinancialTransaction> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(t => t.TransactionType)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(t => t.ReferenceType)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(t => t.ReferenceId)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(t => t.Currency)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(t => t.TotalAmount)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(t => t.PostedBy)
            .HasMaxLength(450);

        builder.HasMany(t => t.Entries)
            .WithOne(e => e.Transaction)
            .HasForeignKey(e => e.TransactionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => new { t.ReferenceType, t.ReferenceId });
        builder.HasIndex(t => t.Status);
    }
}
