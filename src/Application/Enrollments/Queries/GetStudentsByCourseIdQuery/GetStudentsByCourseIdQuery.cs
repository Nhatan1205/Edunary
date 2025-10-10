using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Enrollments.Queries.GetStudentsByCourseIdQuery;
public class GetStudentsByCourseIdQuery : IRequest<List<GetStudentsByCourseIdDto>>
{
    public int CourseId { get; set; }
}

public class GetStudentsByCourseIdQueryHandler : IRequestHandler<GetStudentsByCourseIdQuery, List<GetStudentsByCourseIdDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    public GetStudentsByCourseIdQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }
    public async Task<List<GetStudentsByCourseIdDto>> Handle(GetStudentsByCourseIdQuery request, CancellationToken cancellationToken)
    {
        var enrollments = _context.Enrollments.Where(e => e.CourseId == request.CourseId).ToList();
        var students = new List<GetStudentsByCourseIdDto>();
        foreach (var enrollment in enrollments)
        {
            var user = await _identityService.GetUserById(enrollment.StudentId);
            if (user != null)
            {
                students.Add(new GetStudentsByCourseIdDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    PhoneNumber = user.PhoneNumber,
                    Avatar = user.Avatar
                });
            }
        }
        return students;
    }
}
