namespace Edunary.Application.Common.Interfaces;

public interface IApplicationDbContextFactory
{
    Task<ScopedDbContext> CreateScopedContextAsync(CancellationToken cancellationToken = default);
}

public sealed class ScopedDbContext : IAsyncDisposable
{
    public IApplicationDbContext Context { get; }

    public ScopedDbContext(IApplicationDbContext context)
    {
        Context = context;
    }

    public ValueTask DisposeAsync() =>
        Context is IAsyncDisposable disposable ? disposable.DisposeAsync() : ValueTask.CompletedTask;
}
