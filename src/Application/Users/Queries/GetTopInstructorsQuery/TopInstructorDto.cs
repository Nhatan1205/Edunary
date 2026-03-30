namespace Edunary.Application.Users.Queries.GetTopInstructorsQuery;

public class TopInstructorDto
{
    public string Id { get; set; }
    public string FullName { get; set; }
    public string Avatar { get; set; }
    public string Headline { get; set; }
    public int TotalLearners { get; set; }
    public int TotalCourses { get; set; }
}
