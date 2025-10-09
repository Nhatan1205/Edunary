using MediatR;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Payments.Queries.GetPaymentStatusQuery;

public class GetPaymentStatusQuery : IRequest<Result>
{
    public string PaymentIntentId { get; set; } = string.Empty;
}
