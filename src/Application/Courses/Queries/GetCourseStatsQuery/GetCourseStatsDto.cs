namespace Edunary.Application.Courses.Queries.GetCoursesStatsQuery;
public class GetCourseStatsDto
{
    public int? CourseId { get; set; }
    public string DateRange { get; set; }
    public string AggregationLevel { get; set; }
    public string Metric { get; set; }
    public List<DataPointDto> Data { get; set; }
    public int Total { get; set; }
}

public class DataPointDto
{
    public DateTime Date { get; set; }
    public int Value { get; set; }
}
