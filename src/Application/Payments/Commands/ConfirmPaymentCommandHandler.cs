using MediatR;
using Microsoft.EntityFrameworkCore;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;

namespace Edunary.Application.Payments.Commands;

public class ConfirmPaymentCommandHandler : IRequestHandler<ConfirmPaymentCommand, ConfirmPaymentResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IPaymentService _paymentService;

    public ConfirmPaymentCommandHandler(IApplicationDbContext context, IPaymentService paymentService)
    {
        _context = context;
        _paymentService = paymentService;
    }

    public async Task<ConfirmPaymentResponse> Handle(ConfirmPaymentCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Find the order by PaymentIntentId
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.PaymentIntentId == request.PaymentIntentId, cancellationToken);

            if (order == null)
            {
                return new ConfirmPaymentResponse
                {
                    Success = false,
                    Message = "Order not found"
                };
            }

            // Verify payment with Stripe
            var paymentVerified = await _paymentService.VerifyPaymentAsync(request.PaymentIntentId, cancellationToken);
            
            if (!paymentVerified)
            {
                return new ConfirmPaymentResponse
                {
                    Success = false,
                    Message = "Payment verification failed"
                };
            }

            // Update order status
            order.Status = OrderStatus.Completed;
            order.CompletedDate = DateTime.UtcNow;

            // Create payment record
            var payment = new Domain.Entities.Payment
            {
                OrderId = order.Id,
                PaymentIntentId = request.PaymentIntentId,
                Amount = (decimal)order.TotalAmount,
                Status = PaymentStatus.Succeeded,
                PaidDate = DateTime.UtcNow,
                Currency = "USD" // This could come from Stripe
            };

            _context.Payments.Add(payment);

            // Create enrollments for each course in the order
            foreach (var orderItem in order.OrderItems)
            {
                // Parse CourseId from string to int
                if (int.TryParse(orderItem.CourseId, out int courseId))
                {
                    // Check if enrollment already exists to avoid duplicates
                    var existingEnrollment = await _context.Enrollments
                        .FirstOrDefaultAsync(e => e.CourseId == courseId && 
                                                e.StudentId == order.UserId, 
                                            cancellationToken);

                    if (existingEnrollment == null)
                    {
                        var enrollment = new Domain.Entities.Enrollment
                        {
                            CourseId = courseId,
                            StudentId = order.UserId
                        };

                        _context.Enrollments.Add(enrollment);
                    }
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            return new ConfirmPaymentResponse
            {
                Success = true,
                Message = "Payment confirmed successfully",
                OrderId = order.Id.ToString()
            };
        }
        catch (Exception ex)
        {
            return new ConfirmPaymentResponse
            {
                Success = false,
                Message = $"Error confirming payment: {ex.Message}"
            };
        }
    }
}