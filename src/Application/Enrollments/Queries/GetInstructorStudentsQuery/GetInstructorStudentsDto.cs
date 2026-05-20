namespace Edunary.Application.Enrollments.Queries.GetInstructorStudentsQuery;

public class InstructorStudentDto
{
    public string StudentId { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Avatar { get; set; }
    public int CourseId { get; set; }
    public string CourseTitle { get; set; }
    public DateTimeOffset EnrolledDate { get; set; }
    public int CompletedItems { get; set; }
    public int TotalItems { get; set; }
    public DateTimeOffset LastActiveDate { get; set; }
}
