using MediatR;
using Microsoft.EntityFrameworkCore;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Payments.Commands;

public class CreatePaymentIntentCommandHandler : IRequestHandler<CreatePaymentIntentCommand, CreatePaymentIntentResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IPaymentService _paymentService;

    public CreatePaymentIntentCommandHandler(IApplicationDbContext context, IPaymentService paymentService)
    {
        _context = context;
        _paymentService = paymentService;
    }

    public async Task<CreatePaymentIntentResponse> Handle(CreatePaymentIntentCommand request, CancellationToken cancellationToken)
    {
        // Fetch actual course data from database
        var courses = await _context.Courses
            .Where(c => request.CourseIds.Contains(c.Id.ToString()))
            .ToListAsync(cancellationToken);

        if (!courses.Any())
        {
            throw new Exception("No valid courses found for the provided course IDs");
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
        var paymentResponse = await _paymentService.CreatePaymentIntentAsync(courseList, request.UserEmail, cancellationToken);

        // Create Order in database
        var order = new Order
        {
            UserId = "mock-user-id", // In real app, get from current user
            UserEmail = request.UserEmail,
            TotalAmount = (float)paymentResponse.Amount,
            PaymentIntentId = paymentResponse.PaymentIntentId,
            Status = OrderStatus.Pending,
            OrderDate = DateTime.UtcNow,
            OrderItems = orderItems
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);

        return paymentResponse;
    }
}