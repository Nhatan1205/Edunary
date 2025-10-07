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
        // Mock course data - in real app, you would fetch from Course entity
        var coursePrices = new Dictionary<string, decimal>
        {
            ["course1"] = 99.99m,
            ["course2"] = 149.99m,
            ["course3"] = 199.99m
        };

        // Prepare course payment info and order items
        var courseList = new List<CoursePaymentInfo>();
        var orderItems = new List<OrderItem>();

        foreach (var courseId in request.CourseIds)
        {
            if (coursePrices.TryGetValue(courseId, out var price))
            {
                courseList.Add(new CoursePaymentInfo
                {
                    Id = courseId,
                    Name = $"Course {courseId}",
                    Price = price
                });

                orderItems.Add(new OrderItem
                {
                    CourseId = courseId,
                    CourseName = $"Course {courseId}",
                    Price = (float)price
                });
            }
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