using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

using Edunary.Application.Common.Behaviours;
using Edunary.Domain.Enums;

namespace Edunary.Application.Users.Queries.GetPublicUserInfoQuery;

[ActivityLog(ActivityType.ViewPublicProfile, "View Public Profile")]
public class GetPublicUserInfoQuery : IRequest<PublicProfileDto>
{
    public string Id { get; set; }
}

public class GetPublicUserInfoQueryHandler : IRequestHandler<GetPublicUserInfoQuery, PublicProfileDto>
{
    private readonly IIdentityService _identityService;
    private readonly IApplicationDbContext _context;

    public GetPublicUserInfoQueryHandler(IIdentityService identityService, IApplicationDbContext context)
    {
        _identityService = identityService;
        _context = context;
    }

    public async Task<PublicProfileDto> Handle(GetPublicUserInfoQuery request, CancellationToken cancellationToken)
    {
        var user = await _identityService.GetUserById(request.Id);

        if (user == null)
            return null;

        var courses = await _context.Courses
            .Where(c => c.CreatedBy == request.Id)
            .ToListAsync(cancellationToken);

        var totalLearners = courses.Sum(c => c.TotalStudents);
        var totalReviews = courses.Sum(c => c.TotalRatingStudent);

        UserLinksDto userLink = null;

        if (!string.IsNullOrWhiteSpace(user.Links))
        {
            try
            {
                userLink = JsonSerializer.Deserialize<UserLinksDto>(user.Links);
            }
            catch (JsonException)
            {
                userLink = null;
            }
        }

        return new PublicProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Avatar = user.Avatar,
            Headline = user.Headline,
            Description = user.Description,
            Links = userLink,
            TotalLearners = totalLearners,
            TotalReviews = totalReviews
        };
    }
}
