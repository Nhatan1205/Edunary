using MediatR;

namespace Edunary.Application.Enrollments.Queries.CheckUserEnrollmentQuery;

public record CheckUserEnrollmentQuery(int CourseId) : IRequest<CheckUserEnrollmentDto>;