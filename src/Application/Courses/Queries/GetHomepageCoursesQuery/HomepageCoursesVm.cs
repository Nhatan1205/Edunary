namespace Edunary.Application.Courses.Queries.GetHomepageCoursesQuery;
public class HomepageCoursesVm
{
    public IReadOnlyCollection<GetHomepageCoursesDto> PopularCourses { get; init; } = Array.Empty<GetHomepageCoursesDto>();
    public IReadOnlyCollection<GetHomepageCoursesDto> NewCourses { get; init; } = Array.Empty<GetHomepageCoursesDto>();
    public IReadOnlyCollection<GetHomepageCoursesDto> TopRatedCourses { get; init; } = Array.Empty<GetHomepageCoursesDto>();
}
