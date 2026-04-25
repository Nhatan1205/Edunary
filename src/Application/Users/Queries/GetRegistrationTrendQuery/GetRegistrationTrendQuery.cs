using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Users.Queries.GetRegistrationTrendQuery;

public record GetRegistrationTrendQuery : IRequest<RegistrationTrendDto>
{
    public string Range { get; init; } = "30d";
}

public class GetRegistrationTrendQueryHandler
    : IRequestHandler<GetRegistrationTrendQuery, RegistrationTrendDto>
{
    private readonly IIdentityService _identityService;

    public GetRegistrationTrendQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<RegistrationTrendDto> Handle(
        GetRegistrationTrendQuery request, CancellationToken cancellationToken)
    {
        return await _identityService.GetRegistrationTrendAsync(request.Range, cancellationToken);
    }
}
