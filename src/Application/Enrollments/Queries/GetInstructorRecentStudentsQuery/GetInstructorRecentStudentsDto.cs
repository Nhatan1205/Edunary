namespace Edunary.Application.Enrollments.Queries.GetInstructorRecentStudentsQuery;

public class InstructorRecentStudentDto
{
    public string StudentId { get; set; }
    public string FullName { get; set; }
    public string Avatar { get; set; }
    public string CourseTitle { get; set; }
    public DateTimeOffset EnrolledDate { get; set; }
}

public class InstructorRecentStudentsDto
{
    public int TotalStudents { get; set; }
    public List<InstructorRecentStudentDto> Students { get; set; } = new();
}
