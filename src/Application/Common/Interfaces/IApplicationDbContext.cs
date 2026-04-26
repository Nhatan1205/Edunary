using Edunary.Domain.Entities;

namespace Edunary.Application.Common.Interfaces;
public interface IApplicationDbContext
{
    DbSet<TodoList> TodoLists { get; }

    DbSet<TodoItem> TodoItems { get; }

    DbSet<Payment> Payments { get; }

    DbSet<Order> Orders { get; }

    DbSet<OrderItem> OrderItems { get; }

    public DbSet<Course> Courses { get; }
    public DbSet<Category> Categories { get; }
    public DbSet<Enrollment> Enrollments { get; }

    public DbSet<Cart> Carts { get; }

    public DbSet<Notification> Notifications { get; }

    public DbSet<NotificationUser> NotificationUsers { get; }

    public DbSet<MediaFile> MediaFiles { get; }
    public DbSet<CourseProgress> CourseProgress { get; }

    public DbSet<Announcement> Announcements { get; }
    public DbSet<RatingCourse> RatingCourses { get; }

    public DbSet<Roadmap> Roadmaps { get; }
    public DbSet<RoadmapTopic> RoadmapTopics { get; }

    public DbSet<SystemSetting> SystemSettings { get; }
    public DbSet<VideoCaption> VideoCaptions { get; }
    public DbSet<CourseNote> CourseNotes { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
