using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Edunary.Domain.Entities;

namespace Edunary.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.Property(t => t.UserId)
            .HasMaxLength(450)
            .IsRequired();

        builder.Property(t => t.UserEmail)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(t => t.PaymentIntentId)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.TotalAmount)
            .IsRequired();

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(t => t.OrderDate)
            .IsRequired();

        builder.HasMany(o => o.OrderItems)
            .WithOne(oi => oi.Order)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}