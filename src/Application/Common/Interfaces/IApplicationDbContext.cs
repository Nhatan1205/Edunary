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

    public DbSet<CourseContent> CourseContents { get; }
    public DbSet<CourseProgress> CourseProgress { get; }

    public DbSet<Announcement> Announcements { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
