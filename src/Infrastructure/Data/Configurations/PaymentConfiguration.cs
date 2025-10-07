using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Edunary.Domain.Entities;

namespace Edunary.Infrastructure.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.Property(t => t.OrderId)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.PaymentIntentId)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.Currency)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(t => t.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(t => t.PaidDate)
            .IsRequired();
    }
}