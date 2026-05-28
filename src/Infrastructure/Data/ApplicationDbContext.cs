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
    public DbSet<RatingResponse> RatingResponses => Set<RatingResponse>();

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

    public DbSet<KnowledgeDocument> KnowledgeDocuments => Set<KnowledgeDocument>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Choice> Choices => Set<Choice>();
    public DbSet<QuizAttemptSnapshot> QuizAttemptSnapshots => Set<QuizAttemptSnapshot>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<QuizAttemptAnswer> QuizAttemptAnswers => Set<QuizAttemptAnswer>();
    public DbSet<QuizAttemptAnswerChoice> QuizAttemptAnswerChoices => Set<QuizAttemptAnswerChoice>();

    public DbSet<CourseQuestion> CourseQuestions => Set<CourseQuestion>();
    public DbSet<CourseAnswer> CourseAnswers => Set<CourseAnswer>();
    public DbSet<CourseCollaborator> CourseCollaborators => Set<CourseCollaborator>();
    public DbSet<QuestionUpvote> QuestionUpvotes => Set<QuestionUpvote>();
    public DbSet<AnswerUpvote> AnswerUpvotes => Set<AnswerUpvote>();

    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<AssignmentQuestion> AssignmentQuestions => Set<AssignmentQuestion>();
    public DbSet<AssignmentSubmission> AssignmentSubmissions => Set<AssignmentSubmission>();
    public DbSet<AssignmentFeedback> AssignmentFeedbacks => Set<AssignmentFeedback>();

    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<CouponRedemption> CouponRedemptions => Set<CouponRedemption>();

    public DbSet<FinancialAccount> FinancialAccounts => Set<FinancialAccount>();
    public DbSet<FinancialTransaction> FinancialTransactions => Set<FinancialTransaction>();
    public DbSet<FinancialEntry> FinancialEntries => Set<FinancialEntry>();
    public DbSet<UserAccountBalance> UserAccountBalances => Set<UserAccountBalance>();

    public DbSet<TaxRegion> TaxRegions => Set<TaxRegion>();
    public DbSet<TaxProfile> TaxProfiles => Set<TaxProfile>();

    public DbSet<RevenueSharePlan> RevenueSharePlans => Set<RevenueSharePlan>();

    public DbSet<CourseReviewSubmission> CourseReviewSubmissions => Set<CourseReviewSubmission>();
    public DbSet<CourseReviewFeedback> CourseReviewFeedbacks => Set<CourseReviewFeedback>();
    public DbSet<CourseApprovedSnapshot> CourseApprovedSnapshots => Set<CourseApprovedSnapshot>();

    public DbSet<QualityCheckReport> QualityCheckReports => Set<QualityCheckReport>();
    public DbSet<QualityCheckIssue> QualityCheckIssues => Set<QualityCheckIssue>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
