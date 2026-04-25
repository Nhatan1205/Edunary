using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Carts.Commands.RemoveFromCartCommand;

[ActivityLog(ActivityType.RemoveFromCart, "Removed a course from cart")]
public record RemoveFromCartCommand : IRequest<Result>
{
    public int CartItemId { get; init; }
}

public class RemoveFromCartCommandHandler : IRequestHandler<RemoveFromCartCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public RemoveFromCartCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(RemoveFromCartCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
            {
                return Result.Failure("User not authenticated");
            }

            var cartItem = await _context.Carts
                .FirstOrDefaultAsync(c => c.Id == request.CartItemId && c.CustomerId == userId, 
                    cancellationToken);

            if (cartItem == null)
            {
                return Result.Failure("Cart item not found");
            }

            _context.Carts.Remove(cartItem);
            var result = await _context.SaveChangesAsync(cancellationToken);

            if (result > 0)
            {
                return Result.Success("Item removed from cart successfully");
            }

            return Result.Failure("Failed to remove item from cart");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred: {ex.Message}");
        }
    }
}
