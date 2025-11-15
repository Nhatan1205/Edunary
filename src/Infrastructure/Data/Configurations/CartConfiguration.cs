using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.Property(e => e.CourseId)
            .IsRequired();

        builder.Property(e => e.CustomerId)
            .IsRequired()
            .HasMaxLength(450);

        // Create composite unique index to prevent duplicate enrollments
        builder.HasIndex(e => new { e.CourseId, e.CustomerId })
            .IsUnique()
            .HasDatabaseName("IX_Carts_CourseId_CustomerId");
    }
}
