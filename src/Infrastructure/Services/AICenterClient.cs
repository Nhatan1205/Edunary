using System.Net.Http.Headers;
using System.Text;
using Edunary.Application.Common.Interfaces;
using Edunary.Infrastructure.Helpers;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Services;

/// <summary>
/// HTTP implementation of IAICenterClient using IHttpClientFactory.
/// Lives in Infrastructure so Application stays free of Microsoft.Extensions.Http dependency.
/// </summary>
public class AICenterClient : IAICenterClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AICenterClient> _logger;

    public AICenterClient(IHttpClientFactory httpClientFactory, ILogger<AICenterClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<(bool IsSuccess, string Body)> PostAsync(string url, string apiKey, string jsonBody, CancellationToken ct = default)
    {
        var client = _httpClientFactory.CreateClient();

        //Using HMAC
        //1. Timestamp
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        //2. Hash body
        var bodyHash = HmacHelper.ComputeSha256(jsonBody);
        //3. Create Message 
        var message = $"{timestamp}:{bodyHash}";
        //4. sign signature based on message and secret key
        var signature = HmacHelper.ComputeHmac(apiKey, message);

        client.DefaultRequestHeaders.Add("X-Timestamp", timestamp);
        client.DefaultRequestHeaders.Add("X-Signature", signature);
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        try
        {
            var response = await client.PostAsync(url, content, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("AI Center returned error: {Status} {Body}", response.StatusCode, body);
            }

            return (response.IsSuccessStatusCode, body);
        }
        catch (Exception ex)
        {
            _logger.LogError("AI Center request failed: {Error}", ex.Message);
            return (false, ex.Message);
        }
    }
}
