namespace Edunary.Application.Enrollments.Queries.GetInstructorStudentDetailQuery;

public class InstructorStudentCourseDetailDto
{
    public int CourseId { get; set; }
    public string CourseTitle { get; set; }
    public string CourseImageUrl { get; set; }
    public DateTimeOffset EnrolledDate { get; set; }
    public int CompletedItems { get; set; }
    public int TotalItems { get; set; }
}

public class InstructorStudentDetailDto
{
    public string StudentId { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Avatar { get; set; }
    public DateTimeOffset LastActiveDate { get; set; }
    public List<InstructorStudentCourseDetailDto> Courses { get; set; } = new();
}
