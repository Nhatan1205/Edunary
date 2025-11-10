using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Courses.Queries.GetCoursesWithFilterQuery;
public class GetCoursesWithFilterQuery : IRequest<List<GetCoursesWithFilterDto>> { 
    public string queries { get; init; } 
    public int? CategoryId { get; init; } 
}
public class GetCoursesWithFilterQueryHandler : IRequestHandler<GetCoursesWithFilterQuery, List<GetCoursesWithFilterDto>>
{ 
    private readonly ISearchService _searchService; 
    public GetCoursesWithFilterQueryHandler(ISearchService searchService) 
    { 
        _searchService = searchService; 
    } 
    public async Task<List<GetCoursesWithFilterDto>> Handle(GetCoursesWithFilterQuery request, CancellationToken cancellationToken) 
    { 
        string filters = null; 
        if (request.CategoryId.HasValue) { 
            filters = $"CategoryId = {request.CategoryId.Value}"; 
        } 
        var results = await _searchService.SearchAsync<GetCoursesWithFilterDto>("courses", request.queries, filters); 
        return results.ToList();
    } 
}
