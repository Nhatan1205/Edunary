using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Finance.Queries.GetTopCoursesByRevenue;

public record GetTopCoursesByRevenueQuery : IRequest<List<TopCourseRevenueDto>>
{
    public DateTimeOffset? From { get; init; }
    public DateTimeOffset? To { get; init; }
    public int TopN { get; init; } = 10;
}

public class GetTopCoursesByRevenueQueryHandler : IRequestHandler<GetTopCoursesByRevenueQuery, List<TopCourseRevenueDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTopCoursesByRevenueQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<TopCourseRevenueDto>> Handle(
        GetTopCoursesByRevenueQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders
            .Where(o => o.Status == OrderStatus.Completed);

        if (request.From.HasValue)
            query = query.Where(o => o.CompletedDate >= request.From.Value.DateTime);

        if (request.To.HasValue)
            query = query.Where(o => o.CompletedDate <= request.To.Value.DateTime);

        return await query
            .SelectMany(o => o.OrderItems, (_, oi) => oi)
            .GroupBy(oi => new { oi.CourseId, oi.CourseName })
            .Select(g => new TopCourseRevenueDto
            {
                CourseId     = g.Key.CourseId,
                CourseName   = g.Key.CourseName,
                TotalRevenue = (decimal)g.Sum(oi => (double)oi.Price),
                OrderCount   = g.Count(),
            })
            .OrderByDescending(x => x.TotalRevenue)
            .Take(request.TopN)
            .ToListAsync(cancellationToken);
    }
}
