using MediatR;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Payments.Commands.CreatePaymentIntentCommand;

public class CreatePaymentIntentCommand : IRequest<Result>
{
    public List<string> CourseIds { get; set; } = new();
}
