using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Payments.Commands.CreatePaymentIntentCommand;

public record CreatePaymentIntentCommand : IRequest<ReturnResult<CreatePaymentIntentDto>>
{
    public List<string> CourseIds { get; init; }
}

public class CreatePaymentIntentCommandHandler : IRequestHandler<CreatePaymentIntentCommand, ReturnResult<CreatePaymentIntentDto>>
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

    private CreatePaymentIntentDto CreateFreeOrderPaymentIntent(string userId)
    {
        var freePaymentIntentId = $"free_{Guid.NewGuid():N}";
        _logger.LogInformation(
            "Free checkout detected (amount=0). Skipping Stripe PaymentIntent for user {UserId}. PaymentIntentId={PaymentIntentId}",
            userId,
            freePaymentIntentId
        );
        return new CreatePaymentIntentDto
        {
            ClientSecret = string.Empty,
            Amount = 0m,
            PaymentIntentId = freePaymentIntentId
        };
    }

    public async Task<ReturnResult<CreatePaymentIntentDto>> Handle(CreatePaymentIntentCommand request, CancellationToken cancellationToken)
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
                return new ReturnResult<CreatePaymentIntentDto>
                {
                    Result = null,
                    Message = "User must be authenticated to create a payment intent"
                };
            }

            if (string.IsNullOrEmpty(userEmail))
            {
                _logger.LogWarning("Unauthorized attempt to create payment intent - no user email for user {UserId}", userId);
                return new ReturnResult<CreatePaymentIntentDto>
                {
                    Result = null,
                    Message = "User email is required to create a payment intent"
                };
            }

            // Fetch actual course data from database
            var courses = await _context.Courses
                .Where(c => request.CourseIds.Contains(c.Id.ToString()))
                .ToListAsync(cancellationToken);

            if (!courses.Any())
            {
                _logger.LogWarning("No valid courses found for course IDs: {CourseIds}", string.Join(", ", request.CourseIds));
                return new ReturnResult<CreatePaymentIntentDto>
                {
                    Result = null,
                    Message = "No valid courses found for the provided course IDs"
                };
            }

            // Check if user is the creator of any courses
            var ownedCourses = courses.Where(c => c.CreatedBy == userId).ToList();
            if (ownedCourses.Any())
            {
                var ownedCourseNames = ownedCourses.Select(c => c.Title);
                _logger.LogWarning("User {UserId} is the creator of courses: {CourseNames}", userId, string.Join(", ", ownedCourseNames));
                return new ReturnResult<CreatePaymentIntentDto>
                {
                    Result = null,
                    Message = "You cannot purchase your own courses"
                };
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
                return new ReturnResult<CreatePaymentIntentDto>
                {
                    Result = null,
                    Message = $"You already own the following courses: {string.Join(", ", ownedCourseNames)}"
                };
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

            var totalAmount = courseList.Sum(c => c.Price);
            var amountInCents = (long)decimal.Round(totalAmount * 100m, 0, MidpointRounding.AwayFromZero);

            CreatePaymentIntentDto paymentResponse;

            // Stripe does not allow creating PaymentIntents with amount = 0.
            if (amountInCents <= 0)
            {
                paymentResponse = CreateFreeOrderPaymentIntent(userId);
            }
            else
            {
                // Create payment intent using Stripe service
                paymentResponse = await _paymentService.CreatePaymentIntentAsync(courseList, userEmail, cancellationToken);

                if (paymentResponse == null)
                {
                    _logger.LogError("Failed to create payment intent with Stripe for user {UserId}", userId);
                    return new ReturnResult<CreatePaymentIntentDto>
                    {
                        Result = null,
                        Message = "Failed to create payment intent"
                    };
                }
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
                return new ReturnResult<CreatePaymentIntentDto>
                {
                    Result = null,
                    Message = "Failed to create order"
                };
            }

            _logger.LogInformation("Successfully created payment intent {PaymentIntentId} for order {OrderId}", 
                paymentResponse.PaymentIntentId, order.Id);

            return new ReturnResult<CreatePaymentIntentDto>
            {
                Result = paymentResponse,
                Message = "Payment intent created successfully"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating payment intent for user {UserId}", _currentUserService.UserId);
            return new ReturnResult<CreatePaymentIntentDto>
            {
                Result = null,
                Message = $"An error occurred while creating payment intent: {ex.Message}"
            };
        }
    }
}
