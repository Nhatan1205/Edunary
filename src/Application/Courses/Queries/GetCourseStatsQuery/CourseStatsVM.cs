using Edunary.Application.Courses.Queries.GetCoursesStatsQuery;

namespace Edunary.Application.Courses.Queries.GetCourseStatsQuery;
public class CourseStatsVM
{
    public GetCourseStatsDto Stats { get; set; }
    public GetCourseStatsSummaryDto Summary { get; set; }
}
