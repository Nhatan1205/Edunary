using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Users.Queries.GetNewVsReturningQuery;

public record GetNewVsReturningQuery : IRequest<NewVsReturningDto>
{
    public int Year { get; init; } = DateTime.UtcNow.Year;
}

public class GetNewVsReturningQueryHandler
    : IRequestHandler<GetNewVsReturningQuery, NewVsReturningDto>
{
    private readonly IIdentityService _identityService;

    public GetNewVsReturningQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<NewVsReturningDto> Handle(
        GetNewVsReturningQuery request, CancellationToken cancellationToken)
    {
        return await _identityService.GetNewVsReturningAsync(request.Year, cancellationToken);
    }
}
