namespace Edunary.Domain.Entities;

public class Course : BaseAuditableEntity
{
    public string Title { get; set; }

    public string Subtitle { get; set; }

    public string Description { get; set; }

    public CourseLevel Level { get; set; }

    public CourseStatus Status { get; set; }

    public string Topic { get; set; }

    public string LearningObjectives { get; set; }

    public string Requirements { get; set; }

    public string TargetAudience { get; set; }

    public string ImageUrl { get; set; }

    public string WelcomeMessage { get; set; }
    public string CongratulationsMessage { get; set; }

    public float Price { get; set; }

    public int CategoryId { get; set; }
    public string Content { get; set; }

    public float Ratings { get; set; }

    public int TotalStudents { get; set; }

    // Navigation properties
    public Category Category { get; set; } = null!;

    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public ICollection<CourseContent> Contents { get; set; } = new List<CourseContent>();

    public ICollection<CourseProgress> Progresses { get; set; } = new List<CourseProgress>();

    public ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();

    public void UpdateTotalStudents()
    {
        TotalStudents++;
    }
}
