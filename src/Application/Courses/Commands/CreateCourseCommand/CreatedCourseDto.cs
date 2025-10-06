using Edunary.Application.TodoItems.Queries.GetTodoItemsWithPagination;
using Edunary.Domain.Entities;

namespace Edunary.Application.Courses.Commands.CreateCourse;
public class CreatedCourseDto
{
    public int Id { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Course, CreatedCourseDto>();
        }
    }
}
