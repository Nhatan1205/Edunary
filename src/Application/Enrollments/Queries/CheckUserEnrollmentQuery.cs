using MediatR;

namespace Edunary.Application.Enrollments.Queries;

public record CheckUserEnrollmentQuery(int CourseId, string UserId) : IRequest<CheckUserEnrollmentResponse>;

public class CheckUserEnrollmentResponse
{
    public bool IsEnrolled { get; set; }
    public DateTimeOffset? EnrollmentDate { get; set; }
}