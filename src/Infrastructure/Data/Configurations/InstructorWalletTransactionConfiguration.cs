using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class InstructorWalletTransactionConfiguration : IEntityTypeConfiguration<InstructorWalletTransaction>
{
    public void Configure(EntityTypeBuilder<InstructorWalletTransaction> builder)
    {
        builder.Property(x => x.Currency)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.OrderId)
            .IsRequired();

        builder.Property(x => x.CourseId)
            .IsRequired();

        builder.HasIndex(x => new { x.InstructorWalletId, x.OrderId, x.CourseId })
            .IsUnique()
            .HasFilter("[OrderId] > 0 AND [CourseId] > 0");
    }
}
