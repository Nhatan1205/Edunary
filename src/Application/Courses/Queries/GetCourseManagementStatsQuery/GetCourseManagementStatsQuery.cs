using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Courses.Queries.GetCourseManagementStatsQuery;


public record GetCourseManagementStatsQuery : IRequest<CourseManagementStatsDto>;

//For admin only
public class GetCourseManagementStatsQueryHandler : IRequestHandler<GetCourseManagementStatsQuery, CourseManagementStatsDto>
{
    private readonly IApplicationDbContext _context;

    public GetCourseManagementStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CourseManagementStatsDto> Handle(GetCourseManagementStatsQuery request, CancellationToken cancellationToken)
    {
        var stats = await _context.Courses
            .GroupBy(c => 1)
            .Select(g => new CourseManagementStatsDto
            {
                TotalPublic = g.Count(c => c.Status == CourseStatus.Public),
                TotalPrivate = g.Count(c => c.Status == CourseStatus.Private),
                TotalDraft = g.Count(c => c.Status == CourseStatus.Unpublished),
                TotalModified = g.Count(c => c.Status == CourseStatus.Public && c.ApprovedSnapshots.Any() && c.LastModified > c.ApprovedSnapshots.Max(s => s.Created).AddSeconds(2))
            })
            .FirstOrDefaultAsync(cancellationToken);

        return stats ?? new CourseManagementStatsDto();
    }
}
