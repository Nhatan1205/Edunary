using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class AnswerUpvoteConfiguration : IEntityTypeConfiguration<AnswerUpvote>
{
    public void Configure(EntityTypeBuilder<AnswerUpvote> builder)
    {
        builder.Property(u => u.VoterId)
            .IsRequired()
            .HasMaxLength(450);

        builder.HasOne(u => u.Answer)
            .WithMany(a => a.Upvotes)
            .HasForeignKey(u => u.AnswerId)
            .OnDelete(DeleteBehavior.Cascade);

        // One vote per user per answer
        builder.HasIndex(u => new { u.AnswerId, u.VoterId })
            .IsUnique()
            .HasDatabaseName("UX_AnswerUpvotes_Answer_Voter");
    }
}
