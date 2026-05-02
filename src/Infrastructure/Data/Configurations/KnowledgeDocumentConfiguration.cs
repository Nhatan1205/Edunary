using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class KnowledgeDocumentConfiguration : IEntityTypeConfiguration<KnowledgeDocument>
{
    public void Configure(EntityTypeBuilder<KnowledgeDocument> builder)
    {
        builder.Property(d => d.FileName)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(d => d.FileKey)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(d => d.FileUrl)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(d => d.ContentType)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(d => d.Status)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(d => d.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(d => d.QdrantCollection)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(d => d.Status);
        builder.HasIndex(d => d.FileKey).IsUnique();
    }
}
