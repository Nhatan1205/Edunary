using System.Reflection;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Entities;
using Edunary.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Data;
public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<TodoList> TodoLists => Set<TodoList>();

    public DbSet<TodoItem> TodoItems => Set<TodoItem>();
    public DbSet<Course> Courses => Set<Course>();

    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Payment> Payments => Set<Payment>();

    public DbSet<Order> Orders => Set<Order>();

    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    public DbSet<Enrollment> Enrollments => Set<Enrollment>();

    public DbSet<Notification> Notifications => Set<Notification>();

    public DbSet<NotificationUser> NotificationUsers => Set<NotificationUser>();

    public DbSet<MediaFile> MediaFiles => Set<MediaFile>();

    public DbSet<CourseProgress> CourseProgress => Set<CourseProgress>();

    public DbSet<Cart> Carts => Set<Cart>();

    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<RatingCourse> RatingCourses => Set<RatingCourse>();

    public DbSet<Roadmap> Roadmaps => Set<Roadmap>();
    public DbSet<RoadmapTopic> RoadmapTopics => Set<RoadmapTopic>();

    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<VideoCaption> VideoCaptions => Set<VideoCaption>();
    public DbSet<CourseNote> CourseNotes => Set<CourseNote>();

    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<InstructorWallet> InstructorWallets => Set<InstructorWallet>();
    public DbSet<InstructorWalletTransaction> InstructorWalletTransactions => Set<InstructorWalletTransaction>();
    public DbSet<WithdrawalRequest> WithdrawalRequests => Set<WithdrawalRequest>();
    public DbSet<PendingRegistration> PendingRegistrations => Set<PendingRegistration>();

    public DbSet<LearnerProfile> LearnerProfiles => Set<LearnerProfile>();

    protected override void OnModelCreating(ModelBuilder builder)
    {        
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
