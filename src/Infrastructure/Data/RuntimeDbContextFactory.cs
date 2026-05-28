using Edunary.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Data;

public class RuntimeDbContextFactory : IApplicationDbContextFactory
{
    private readonly IDbContextFactory<ApplicationDbContext> _factory;

    public RuntimeDbContextFactory(IDbContextFactory<ApplicationDbContext> factory)
    {
        _factory = factory;
    }

    public async Task<ScopedDbContext> CreateScopedContextAsync(CancellationToken cancellationToken = default)
    {
        var context = await _factory.CreateDbContextAsync(cancellationToken);
        return new ScopedDbContext(context);
    }
}
