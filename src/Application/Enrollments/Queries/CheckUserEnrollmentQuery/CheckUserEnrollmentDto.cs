namespace Edunary.Application.Enrollments.Queries.CheckUserEnrollmentQuery;

public class CheckUserEnrollmentDto
{
    public bool IsEnrolled { get; set; }
    public DateTimeOffset? EnrollmentDate { get; set; }
}