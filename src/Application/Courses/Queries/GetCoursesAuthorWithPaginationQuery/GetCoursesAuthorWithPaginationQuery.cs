using System;
using System.Collections.Generic;
using System.Linq;
using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;


namespace Edunary.Application.Courses.Queries.GetCoursesAuthorWithPagination;

[ActivityLog(ActivityType.AccessUserCoursesPage, "access user's courses page")]
public class GetCoursesAuthorWithPaginationQuery : IRequest<PaginatedList<GetCoursesAuthorDto>>
{
    public string SearchText { get; init; }
    public CourseManagementSortBy sortBy { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public CoursePermission? RequiredPermission { get; init; } = null;
}

public class GetCoursesAuthorWithPaginationQueryHandler : IRequestHandler<GetCoursesAuthorWithPaginationQuery, PaginatedList<GetCoursesAuthorDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    public GetCoursesAuthorWithPaginationQueryHandler(IApplicationDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedList<GetCoursesAuthorDto>> Handle(GetCoursesAuthorWithPaginationQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;

        var query = _context.Courses
            .Where(c => c.CreatedBy == userId ||
                        (request.RequiredPermission != null && c.Collaborators.Any(cc =>
                            cc.UserId == userId &&
                            cc.InviteStatus == CollaboratorInviteStatus.Accepted &&
                            cc.Permissions.HasFlag(request.RequiredPermission.Value))))
            .AsQueryable();

        //sort courses
        switch (request.sortBy)
        {
            case CourseManagementSortBy.Oldest:
                query = query.OrderBy(x => x.Created);
                break;
            case CourseManagementSortBy.TitleAscending:
                query = query.OrderBy(x => x.Title);
                break;
            case CourseManagementSortBy.TitleDescending:
                query = query.OrderByDescending(x => x.Title);
                break;
            case CourseManagementSortBy.PublishedFirst:
                query = query.OrderByDescending(x => x.Status)
                            .ThenBy(x => x.Title);
                break;
            case CourseManagementSortBy.UnpublishedFirst:
                query = query.OrderBy(x => x.Status)
                            .ThenBy(x => x.Title);
                break;
            case CourseManagementSortBy.Newest:
            default:
                query = query.OrderByDescending(x => x.Created);
                break;

        }

        // search courses based on title
        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            string search = request.SearchText.Trim().ToLower();
            query = query.Where(c => c.Title.ToLower().Contains(search));
        }

        return await query
            .Select(c => new GetCoursesAuthorDto
            {
                Id = c.Id,
                Title = c.Title,
                Subtitle = c.Subtitle,
                Price = c.Price,
                CategoryId = c.CategoryId,
                ImageUrl = c.ImageUrl,
                TotalStudents = c.TotalStudents,
                Ratings = c.Ratings,
                Status = c.Status,
                Created = c.Created,
                IsOwner = c.CreatedBy == userId,
                IsCollaborator = c.CreatedBy != userId && c.Collaborators.Any(cc => cc.UserId == userId && cc.InviteStatus == CollaboratorInviteStatus.Accepted)
            })
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}
