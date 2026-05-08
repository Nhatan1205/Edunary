using Edunary.Domain.Entities;

namespace Edunary.Application.CourseAnswers.Queries.GetCourseAnswers;

public class CourseAnswerDto
{
    public int Id { get; set; }
    public int QuestionId { get; set; }
    public string Body { get; set; } = string.Empty;
    public bool IsTopAnswer { get; set; }
    public int UpvoteCount { get; set; }
    public DateTimeOffset Created { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    public string AuthorName { get; set; }
    public string AuthorAvatar { get; set; }
    public bool IsInstructor { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CourseAnswer, CourseAnswerDto>();
        }
    }
}
