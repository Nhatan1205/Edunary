using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Carts.Queries.GetCartItemsQuery;

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

        // Parse course IDs
        var courseIds = carts
            .Select(c => int.TryParse(c.CourseId, out var id) ? id : 0)
            .Where(id => id > 0)
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
        foreach (var creatorId in creatorIds)
        {
            var userName = await _identityService.GetFullNameAsync(creatorId);
            creators[creatorId] = userName;
        }

        // Join in memory
        var cartItems = carts
            .Join(courses,
                cart => int.TryParse(cart.CourseId, out var id) ? id : 0,
                course => course.Id,
                (cart, course) => new CartItemDto
                {
                    Id = cart.Id,
                    CourseId = course.Id,
                    Title = course.Title,
                    Subtitle = course.Subtitle ?? string.Empty,
                    ImageUrl = course.ImageUrl ?? string.Empty,
                    InstructorName = creators.GetValueOrDefault(course.CreatedBy, "Unknown"),
                    Price = course.Price,
                    Rating = 0, // TODO: Calculate from reviews
                    ReviewCount = 0, // TODO: Get from reviews
                    Level = course.Level.ToString(),
                    TotalLectures = 0, // TODO: Calculate from sections/lectures
                    TotalHours = 0 // TODO: Calculate from sections/lectures
                })
            .ToList();

        return cartItems;
    }
}
