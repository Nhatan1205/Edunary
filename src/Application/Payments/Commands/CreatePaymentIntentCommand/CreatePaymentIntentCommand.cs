using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Payments.Commands.CreatePaymentIntentCommand;

public record CreatePaymentIntentCommand : IRequest<Result>
{
    public List<string> CourseIds { get; init; }
}

public class CreatePaymentIntentCommandHandler : IRequestHandler<CreatePaymentIntentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IPaymentService _paymentService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CreatePaymentIntentCommandHandler> _logger;

    public CreatePaymentIntentCommandHandler(
        IApplicationDbContext context, 
        IPaymentService paymentService, 
        ICurrentUserService currentUserService,
        ILogger<CreatePaymentIntentCommandHandler> logger)
    {
        _context = context;
        _paymentService = paymentService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(CreatePaymentIntentCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Creating payment intent for {CourseCount} courses for user {UserId}", 
                request.CourseIds.Count, _currentUserService.UserId);

            // Validate user authentication
            var userId = _currentUserService.UserId;
            var userEmail = _currentUserService.Email;

            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Unauthorized attempt to create payment intent - no user ID");
                return Result.Failure("User must be authenticated to create a payment intent");
            }

            if (string.IsNullOrEmpty(userEmail))
            {
                _logger.LogWarning("Unauthorized attempt to create payment intent - no user email for user {UserId}", userId);
                return Result.Failure("User email is required to create a payment intent");
            }

            // Fetch actual course data from database
            var courses = await _context.Courses
                .Where(c => request.CourseIds.Contains(c.Id.ToString()))
                .ToListAsync(cancellationToken);

            if (!courses.Any())
            {
                _logger.LogWarning("No valid courses found for course IDs: {CourseIds}", string.Join(", ", request.CourseIds));
                return Result.Failure("No valid courses found for the provided course IDs");
            }

            // Check if user is the creator of any courses
            var ownedCourses = courses.Where(c => c.CreatedBy == userId).ToList();
            if (ownedCourses.Any())
            {
                var ownedCourseNames = ownedCourses.Select(c => c.Title);
                _logger.LogWarning("User {UserId} is the creator of courses: {CourseNames}", userId, string.Join(", ", ownedCourseNames));
                return Result.Failure($"You cannot purchase your own courses: {string.Join(", ", ownedCourseNames)}");
            }

            // Check if user already owns some of these courses
            var existingEnrollments = await _context.Enrollments
                .Where(e => e.StudentId == userId && courses.Select(c => c.Id).Contains(e.CourseId))
                .Select(e => e.CourseId)
                .ToListAsync(cancellationToken);

            if (existingEnrollments.Any())
            {
                var ownedCourseNames = courses
                    .Where(c => existingEnrollments.Contains(c.Id))
                    .Select(c => c.Title);
                
                _logger.LogWarning("User {UserId} already owns courses: {CourseNames}", userId, string.Join(", ", ownedCourseNames));
                return Result.Failure($"You already own the following courses: {string.Join(", ", ownedCourseNames)}");
            }

            // Prepare course payment info and order items
            var courseList = new List<CoursePaymentInfo>();
            var orderItems = new List<OrderItem>();

            foreach (var course in courses)
            {
                courseList.Add(new CoursePaymentInfo
                {
                    Id = course.Id.ToString(),
                    Name = course.Title,
                    Price = (decimal)course.Price
                });

                orderItems.Add(new OrderItem
                {
                    CourseId = course.Id.ToString(),
                    CourseName = course.Title,
                    Price = course.Price
                });
            }

            // Create payment intent using Stripe service
            var paymentResponse = await _paymentService.CreatePaymentIntentAsync(courseList, userEmail, cancellationToken);

            if (paymentResponse == null)
            {
                _logger.LogError("Failed to create payment intent with Stripe for user {UserId}", userId);
                return Result.Failure("Failed to create payment intent");
            }

            // Create Order in database
            var order = new Order
            {
                UserId = userId,
                UserEmail = userEmail,
                TotalAmount = (float)paymentResponse.Amount,
                PaymentIntentId = paymentResponse.PaymentIntentId,
                Status = OrderStatus.Pending,
                OrderDate = DateTime.UtcNow,
                OrderItems = orderItems
            };

            _context.Orders.Add(order);
            var result = await _context.SaveChangesAsync(cancellationToken);

            if (result <= 0)
            {
                _logger.LogError("Failed to save order to database for user {UserId}", userId);
                return Result.Failure("Failed to create order");
            }

            _logger.LogInformation("Successfully created payment intent {PaymentIntentId} for order {OrderId}", 
                paymentResponse.PaymentIntentId, order.Id);

            return Result.Success(paymentResponse, "Payment intent created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating payment intent for user {UserId}", _currentUserService.UserId);
            return Result.Failure($"An error occurred while creating payment intent: {ex.Message}");
        }
    }
}
