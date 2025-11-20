using Edunary.Application.Common.Models;

namespace Edunary.Application.Common.Interfaces;
public interface IFilterService
{
    IQueryable<T> HandleFilters<T>(IQueryable<T> query, List<FilterData> filters);

}

