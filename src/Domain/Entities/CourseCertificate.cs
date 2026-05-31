namespace Edunary.Domain.Entities;

public class CourseCertificate : BaseAuditableEntity
{
    public int CourseId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string CertificateNumber { get; set; } = string.Empty;
    public DateTimeOffset CompletedDate { get; set; }
    
    // Snapshot data (preserve at time of completion)
    public string CourseTitleSnapshot { get; set; } = string.Empty;
    public string InstructorNameSnapshot { get; set; } = string.Empty;
    public string StudentNameSnapshot { get; set; } = string.Empty;
    
    // Navigation
    public Course Course { get; set; } = null!;
}
