using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.Property(c => c.Code)
            .HasMaxLength(15)
            .IsRequired();

        builder.HasIndex(c => c.Code)
            .IsUnique();

        builder.Property(c => c.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(c => c.Description)
            .HasMaxLength(1000);

        builder.Property(c => c.Type)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(c => c.DiscountValue)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(c => c.ScopeType)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(c => c.FunderType)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(c => c.OwnerUserId)
            .HasMaxLength(450);

        builder.HasIndex(c => c.OwnerUserId);
        builder.HasIndex(c => c.CourseId);

        builder.HasMany(c => c.Redemptions)
            .WithOne(r => r.Coupon)
            .HasForeignKey(r => r.CouponId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
