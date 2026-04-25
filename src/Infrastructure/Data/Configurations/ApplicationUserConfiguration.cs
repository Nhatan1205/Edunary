using Edunary.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.Property(x => x.Bank)
            .HasMaxLength(150);

        builder.Property(x => x.BankNumber)
            .HasMaxLength(50);

        builder.Property(x => x.BankAccountHolder)
            .HasMaxLength(150);
    }
}
