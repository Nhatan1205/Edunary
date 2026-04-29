using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Edunary.Application.Common.Interfaces;
public interface IApplicationDbContext
{
    DatabaseFacade Database { get; }

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

    public DbSet<ActivityLog> ActivityLogs { get; }

    public DbSet<InstructorWallet> InstructorWallets { get; }
    public DbSet<InstructorWalletTransaction> InstructorWalletTransactions { get; }
    public DbSet<WithdrawalRequest> WithdrawalRequests { get; }

    public DbSet<LearnerProfile> LearnerProfiles { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
