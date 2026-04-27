using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class PendingRegistrationConfiguration : IEntityTypeConfiguration<PendingRegistration>
{
    public void Configure(EntityTypeBuilder<PendingRegistration> builder)
    {
        builder.Property(x => x.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.NormalizedEmail)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.FullName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.PhoneNumber)
            .HasMaxLength(15);

        builder.Property(x => x.PasswordHash)
            .IsRequired()
            .HasMaxLength(2048);

        builder.Property(x => x.TokenHash)
            .IsRequired()
            .HasMaxLength(128);

        builder.HasIndex(x => x.TokenHash)
            .HasDatabaseName("IX_PendingRegistrations_TokenHash");

        builder.HasIndex(x => x.NormalizedEmail)
            .HasDatabaseName("IX_PendingRegistrations_NormalizedEmail");

        builder.HasIndex(x => new { x.NormalizedEmail, x.UsedAt })
            .HasDatabaseName("IX_PendingRegistrations_NormalizedEmail_UsedAt");
    }
}
