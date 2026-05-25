using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Courses.Queries.GetPublishedCoursesForAdminQuery;

public record GetPublishedCoursesForAdminQuery : IRequest<PaginatedList<PublishedCourseForAdminDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string SearchQuery { get; init; }
    public int? CategoryId { get; init; }
    public bool ModifiedOnly { get; init; }
    public string SortBy { get; init; }
}

public class GetPublishedCoursesForAdminQueryHandler : IRequestHandler<GetPublishedCoursesForAdminQuery, PaginatedList<PublishedCourseForAdminDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IMapper _mapper;

    public GetPublishedCoursesForAdminQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        IMapper mapper)
    {
        _context = context;
        _identityService = identityService;
        _mapper = mapper;
    }

    public async Task<PaginatedList<PublishedCourseForAdminDto>> Handle(GetPublishedCoursesForAdminQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Courses
            .Where(c => c.Status == CourseStatus.Public || c.Status == CourseStatus.Private);

        // Search filter
        if (!string.IsNullOrWhiteSpace(request.SearchQuery))
        {
            var search = request.SearchQuery.Trim().ToLower();
            query = query.Where(c => c.Title.ToLower().Contains(search) || c.Subtitle.ToLower().Contains(search));
        }

        // Category filter
        if (request.CategoryId.HasValue)
        {
            query = query.Where(c => c.CategoryId == request.CategoryId.Value);
        }

        // ModifiedOnly filter
        if (request.ModifiedOnly)
        {
            // Add 2-second buffer to ignore millisecond differences when course and snapshot are saved at the same time
            query = query.Where(c => c.ApprovedSnapshots.Any() && c.LastModified > c.ApprovedSnapshots.Max(s => s.Created).AddSeconds(2));
        }

        // Sorting
        query = request.SortBy?.ToLower() switch
        {
            "title_asc" => query.OrderBy(c => c.Title),
            "newest_first" => query.OrderByDescending(c => c.Created),
            "most_students" => query.OrderByDescending(c => c.TotalStudents),
            "highest_rating" => query.OrderByDescending(c => c.Ratings),
            "recently_modified" => query.OrderByDescending(c => c.LastModified),
            _ => query.OrderByDescending(c => c.LastModified)
        };

        // Project and Paginate
        var paginatedList = await query
            .ProjectTo<PublishedCourseForAdminDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        // Get User Details
        var instructorIds = paginatedList.Items
            .Select(c => c.InstructorId)
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        if (instructorIds.Any())
        {
            var identities = await _identityService.GetUserIdentitiesByIdsAsync(instructorIds, cancellationToken);
            var identityMap = identities.ToDictionary(i => i.Id, i => i);

            foreach (var item in paginatedList.Items)
            {
                if (!string.IsNullOrEmpty(item.InstructorId) && identityMap.TryGetValue(item.InstructorId, out var identity))
                {
                    item.InstructorName = identity.FullName ?? identity.Email;
                    item.InstructorAvatar = identity.Avatar;
                }
            }
        }

        return paginatedList;
    }
}


