namespace Edunary.Application.Common.Interfaces;
public interface ISearchService
{
    Task IndexAsync(string indexName, object data);
    Task<IEnumerable<T>> SearchAsync<T>(string indexName, string query, string filters);
}

