namespace Edunary.Application.Common.Interfaces;
public interface IAICenterClient
{
    Task<(bool IsSuccess, string Body)> PostAsync(string url, string apiKey, string jsonBody, CancellationToken ct = default);
}
