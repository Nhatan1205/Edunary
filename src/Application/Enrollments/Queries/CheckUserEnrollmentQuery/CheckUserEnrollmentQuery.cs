using MediatR;
using Microsoft.EntityFrameworkCore;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Enrollments.Queries.CheckUserEnrollmentQuery;

public record CheckUserEnrollmentQuery(int CourseId) : IRequest<CheckUserEnrollmentDto>;

public class CheckUserEnrollmentQueryHandler : IRequestHandler<CheckUserEnrollmentQuery, CheckUserEnrollmentDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CheckUserEnrollmentQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<CheckUserEnrollmentDto> Handle(CheckUserEnrollmentQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        
        if (string.IsNullOrEmpty(userId))
        {
            return new CheckUserEnrollmentDto
            {
                IsEnrolled = false
            };
        }

        // Check if user is enrolled in the course
        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.CourseId == request.CourseId && e.StudentId == userId, cancellationToken);

        return new CheckUserEnrollmentDto
        {
            IsEnrolled = enrollment != null,
            EnrollmentDate = enrollment?.Created
        };
    }
}