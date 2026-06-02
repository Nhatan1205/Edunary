using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.DirectMessages.Queries.SearchMessageableUsersQuery;

public class SearchMessageableUsersQuery : IRequest<List<UserIdentityDto>>
{
    public string SearchText { get; set; }
}

public class SearchMessageableUsersQueryHandler : IRequestHandler<SearchMessageableUsersQuery, List<UserIdentityDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public SearchMessageableUsersQueryHandler(
        IApplicationDbContext context,
        IUser currentUser,
        IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<List<UserIdentityDto>> Handle(SearchMessageableUsersQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id;
        if (string.IsNullOrEmpty(currentUserId))
        {
            return new List<UserIdentityDto>();
        }

        // --- Role Context 1: Current user as INSTRUCTOR ---
        // Fetch all courses taught (owned or visible collaborator accepted) by the current user
        var ownedCourseIds = await _context.Courses
            .Where(c => c.CreatedBy == currentUserId)
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);

        var collaboratedCourseIds = await _context.CourseCollaborators
            .Where(cc => cc.UserId == currentUserId
                && cc.IsVisible
                && cc.InviteStatus == CollaboratorInviteStatus.Accepted)
            .Select(cc => cc.CourseId)
            .ToListAsync(cancellationToken);

        var taughtCourseIds = ownedCourseIds.Concat(collaboratedCourseIds).Distinct().ToList();

        // Students enrolled in these taught courses are messageable
        var studentIds = new List<string>();
        if (taughtCourseIds.Any())
        {
            studentIds = await _context.Enrollments
                .Where(e => taughtCourseIds.Contains(e.CourseId))
                .Select(e => e.StudentId)
                .Distinct()
                .ToListAsync(cancellationToken);
        }

        // --- Role Context 2: Current user as STUDENT ---
        // Fetch all courses enrolled by current user
        var enrolledCourseIds = await _context.Enrollments
            .Where(e => e.StudentId == currentUserId)
            .Select(e => e.CourseId)
            .ToListAsync(cancellationToken);

        // Instructors (owners or visible collaborator accepted) of these courses are messageable
        var instructorsOfEnrolledCourses = new List<string>();
        if (enrolledCourseIds.Any())
        {
            var instructorIdsFromOwner = await _context.Courses
                .Where(c => enrolledCourseIds.Contains(c.Id))
                .Select(c => c.CreatedBy)
                .ToListAsync(cancellationToken);

            var instructorIdsFromCollaborator = await _context.CourseCollaborators
                .Where(cc => enrolledCourseIds.Contains(cc.CourseId)
                    && cc.IsVisible
                    && cc.InviteStatus == CollaboratorInviteStatus.Accepted)
                .Select(cc => cc.UserId)
                .ToListAsync(cancellationToken);

            instructorsOfEnrolledCourses = instructorIdsFromOwner
                .Concat(instructorIdsFromCollaborator)
                .Distinct()
                .ToList();
        }

        // Merge all messageable IDs, excluding the current user
        var eligibleUserIds = studentIds
            .Concat(instructorsOfEnrolledCourses)
            .Distinct()
            .Where(id => id != currentUserId)
            .ToList();

        if (!eligibleUserIds.Any())
        {
            return new List<UserIdentityDto>();
        }

        // Filter using SearchText if provided
        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var keywordUserIds = await _identityService.SearchUserIdsByKeywordAsync(request.SearchText, cancellationToken);
            eligibleUserIds = eligibleUserIds.Intersect(keywordUserIds).ToList();
        }

        if (!eligibleUserIds.Any())
        {
            return new List<UserIdentityDto>();
        }

        // Batch resolve full UserIdentity profiles from Identity database
        var profiles = await _identityService.GetUserIdentitiesByIdsAsync(eligibleUserIds, cancellationToken);

        return profiles.ToList();
    }
}
