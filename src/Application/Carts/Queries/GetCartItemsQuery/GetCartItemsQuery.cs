using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;

using Edunary.Application.Common.Behaviours;

namespace Edunary.Application.Carts.Queries.GetCartItemsQuery;

[ActivityLog(ActivityType.AccessCart, "Access Cart")]
public record GetCartItemsQuery : IRequest<List<CartItemDto>>;

public class GetCartItemsQueryHandler : IRequestHandler<GetCartItemsQuery, List<CartItemDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetCartItemsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<List<CartItemDto>> Handle(GetCartItemsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        if (string.IsNullOrEmpty(userId))
        {
            return new List<CartItemDto>();
        }

        // Get cart items first
        var carts = await _context.Carts
            .Where(c => c.CustomerId == userId)
            .ToListAsync(cancellationToken);

        if (!carts.Any())
        {
            return new List<CartItemDto>();
        }

        var courseIds = carts
            .Select(c => c.CourseId)
            .Where(id => id > 0)
            .Distinct()
            .ToList();

        if (!courseIds.Any())
        {
            return new List<CartItemDto>();
        }

        // Get courses
        var courses = await _context.Courses
            .Where(c => courseIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

        // Get unique creator IDs and fetch their names
        var creatorIds = courses
            .Select(c => c.CreatedBy)
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        var creators = new Dictionary<string, string>();
        if (creatorIds.Any())
        {
            var creatorIdentities = await _identityService.GetUserIdentitiesByIdsAsync(creatorIds, cancellationToken);
            foreach (var identity in creatorIdentities)
            {
                creators[identity.Id] = identity.FullName;
            }
        }

        // Get visible collaborators for these courses
        var visibleCollabs = await _context.CourseCollaborators
            .Where(c => courseIds.Contains(c.CourseId) && c.IsVisible && c.InviteStatus == CollaboratorInviteStatus.Accepted)
            .ToListAsync(cancellationToken);

        var collabUserIds = visibleCollabs.Select(c => c.UserId).Distinct().ToList();
        var collabNames = new Dictionary<string, string>();

        if (collabUserIds.Any())
        {
            var collabIdentities = await _identityService.GetUserIdentitiesByIdsAsync(collabUserIds, cancellationToken);
            foreach (var identity in collabIdentities)
            {
                collabNames[identity.Id] = identity.FullName;
            }
        }

        // Join in memory
        var cartItems = carts
            .Join(courses,
                cart => cart.CourseId,
                course => course.Id,
                (cart, course) =>
                {
                    var ownerName = creators.GetValueOrDefault(course.CreatedBy, "Unknown");
                    var courseCollabs = visibleCollabs.Where(c => c.CourseId == course.Id).ToList();
                    var collabsString = string.Join(", ", courseCollabs.Select(c => collabNames.GetValueOrDefault(c.UserId, "")).Where(n => !string.IsNullOrEmpty(n)));
                    var finalInstructorName = string.IsNullOrEmpty(collabsString) ? ownerName : $"{ownerName}, {collabsString}";

                    return new CartItemDto
                    {
                        Id = cart.Id,
                        CourseId = course.Id,
                        Title = course.Title,
                        Subtitle = course.Subtitle ?? string.Empty,
                        ImageUrl = course.ImageUrl ?? string.Empty,
                        InstructorName = finalInstructorName,
                        Price = course.Price,
                        Level = course.Level.ToString(),
                        TotalLectures = 0, // TODO: Calculate from sections/lectures
                        TotalHours = 0, // TODO: Calculate from sections/lectures
                        TotalRatingStudent = course.TotalRatingStudent,
                        Ratings = course.Ratings
                    };
                })
            .ToList();

        return cartItems;
    }
}
