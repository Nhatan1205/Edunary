using Edunary.Domain.Entities;

namespace Edunary.Application.CourseQuestions.Commands.CreateCourseQuestionCommand;

public class CreatedCourseQuestionDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string ItemId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Detail { get; set; }
    public int AnswerCount { get; set; }
    public int UpvoteCount { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsRead { get; set; }
    public DateTimeOffset Created { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CourseQuestion, CreatedCourseQuestionDto>();
        }
    }
}
