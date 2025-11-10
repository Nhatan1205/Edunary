using Algolia.Search.Clients;
using Algolia.Search.Models.Search;
using Edunary.Application.Common.Interfaces;
using Edunary.Infrastructure.Helpers;
using Microsoft.Extensions.Options;

namespace Edunary.Infrastructure.Services;
public class SearchService : ISearchService
{
    private readonly SearchClient _client;
    public SearchService(IOptions<AlgoliaSettings> config)
    {
        _client = new SearchClient(config.Value.AppId, config.Value.ApiKey);
    }

    public Task IndexAsync(string indexName, object data)
    {
        return _client.SaveObjectAsync(indexName, data);
    }

    public async Task<IEnumerable<T>> SearchAsync<T>(string indexName, string query, string filters)
    {
        SearchParams searchParams = new SearchParams(
            new SearchParamsObject
            {
                Query = query,
                Filters = filters,
            }
        );
        var response = await _client.SearchSingleIndexAsync<T>(indexName,searchParams);
        return response.Hits;
    }
}

