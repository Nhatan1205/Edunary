using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Carts.Commands.AddToCartCommand;

public record AddToCartCommand : IRequest<Result>
{
    public string CourseId { get; init; }
}

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AddToCartCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
            {
                return Result.Failure("User not authenticated");
            }

            // Parse CourseId to int for enrollment check
            if (!int.TryParse(request.CourseId, out int courseIdInt))
            {
                return Result.Failure("Invalid course ID");
            }

            // Check if course exists and if the user is the creator
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == courseIdInt, cancellationToken);

            if (course == null)
            {
                return Result.Failure("Course not found");
            }
            if (userId == course.CreatedBy)
            {
                return Result.Success("You cannot add your own course to the cart");
            }

            // Check if already in cart
            var existingCartItem = await _context.Carts
                .FirstOrDefaultAsync(c => c.CourseId == request.CourseId && c.CustomerId == userId, 
                    cancellationToken);

            if (existingCartItem != null)
            {
                return Result.Success("This course is already in your cart");
            }

            // Check if already enrolled
            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == courseIdInt && e.StudentId == userId, 
                    cancellationToken);

            if (existingEnrollment != null)
            {
                return Result.Success("This course has already been paid for by you");
            }

            // Add to cart
            var cartItem = new Cart
            {
                CourseId = request.CourseId,
                CustomerId = userId
            };

            _context.Carts.Add(cartItem);
            var result = await _context.SaveChangesAsync(cancellationToken);

            if (result > 0)
            {
                return Result.Success("Course added to cart successfully");
            }

            return Result.Failure("Failed to add course to cart");
        }
        catch (DbUpdateException dbEx)
        {
            return Result.Failure($"A database error occurred: {dbEx.Message}");
        }
        catch (InvalidOperationException invOpEx)
        {
            return Result.Failure($"An invalid operation occurred: {invOpEx.Message}");
        }
        catch (ArgumentException argEx)
        {
            return Result.Failure($"An argument error occurred: {argEx.Message}");
        }
    }
}
