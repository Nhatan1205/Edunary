using MediatR;
using Microsoft.EntityFrameworkCore;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Enrollments.Queries;

public class CheckUserEnrollmentQueryHandler : IRequestHandler<CheckUserEnrollmentQuery, CheckUserEnrollmentResponse>
{
    private readonly IApplicationDbContext _context;

    public CheckUserEnrollmentQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CheckUserEnrollmentResponse> Handle(CheckUserEnrollmentQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.UserId))
        {
            return new CheckUserEnrollmentResponse
            {
                IsEnrolled = false
            };
        }

        // Check if user is enrolled in the course
        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.CourseId == request.CourseId && e.StudentId == request.UserId, cancellationToken);

        return new CheckUserEnrollmentResponse
        {
            IsEnrolled = enrollment != null,
            EnrollmentDate = enrollment?.Created
        };
    }
}