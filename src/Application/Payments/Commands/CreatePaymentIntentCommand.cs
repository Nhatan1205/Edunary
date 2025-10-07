using MediatR;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Payments.Commands;

public class CreatePaymentIntentCommand : IRequest<CreatePaymentIntentResponse>
{
    public List<string> CourseIds { get; set; } = new();
    public string UserEmail { get; set; } = string.Empty;
}