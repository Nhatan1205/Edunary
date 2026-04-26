using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations;

public class CourseNoteConfiguration : IEntityTypeConfiguration<CourseNote>
{
    public void Configure(EntityTypeBuilder<CourseNote> builder)
    {
        builder.Property(n => n.StudentId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(n => n.Content)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(n => n.ItemId)
            .HasMaxLength(100);

        builder.HasOne(n => n.Course)
            .WithMany(c => c.CourseNotes)
            .HasForeignKey(n => n.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(n => n.MediaFile)
            .WithMany(m => m.CourseNotes)
            .HasForeignKey(n => n.VideoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(n => new { n.StudentId, n.CourseId, n.VideoId, n.TimestampSeconds })
            .HasDatabaseName("IX_CourseNotes_Student_Course_Video_Timestamp");

        builder.HasIndex(n => new { n.StudentId, n.CourseId, n.Created })
            .HasDatabaseName("IX_CourseNotes_Student_Course_Created");
    }
}
