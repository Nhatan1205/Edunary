using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class QuestionUpvoteConfiguration : IEntityTypeConfiguration<QuestionUpvote>
{
    public void Configure(EntityTypeBuilder<QuestionUpvote> builder)
    {
        builder.Property(u => u.VoterId)
            .IsRequired()
            .HasMaxLength(450);

        builder.HasOne(u => u.Question)
            .WithMany(q => q.Upvotes)
            .HasForeignKey(u => u.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // One vote per user per question
        builder.HasIndex(u => new { u.QuestionId, u.VoterId })
            .IsUnique()
            .HasDatabaseName("UX_QuestionUpvotes_Question_Voter");
    }
}
