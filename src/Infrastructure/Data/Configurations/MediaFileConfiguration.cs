using Microsoft.EntityFrameworkCore;
using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Edunary.Infrastructure.Data.Configurations
{
    public class MediaFileConfiguration : IEntityTypeConfiguration<MediaFile>
    {
        public void Configure(EntityTypeBuilder<MediaFile> builder)
        {
            builder.Property(cc => cc.UserId)
                .IsRequired()
                .HasMaxLength(450);

            builder.Property(cc => cc.FileName)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(cc => cc.FileUrl)
                .IsRequired();
                
            builder.Property(cc => cc.ContentType)
                .HasMaxLength(100);

            builder.Property(cc => cc.IsDeleted)
                .HasDefaultValue(false)   
                .IsRequired();

            // Configure relationship with Course
            builder.HasOne(cc => cc.Course)
                .WithMany(c => c.MediaFiles) 
                .HasForeignKey(cc => cc.CourseId) 
                .IsRequired(false) 
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
