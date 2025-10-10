using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Edunary.Application.Courses.Queries.GetCoursesAuthorWithPagination;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Enrollments.Queries.GetCoursesByStudentIdQuery;
public class GetCouresByStudentIdDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public float Price { get; set; }
    public int CategoryId { get; set; }
    public string ImageUrl { get; set; }
    public CourseStatus Status { get; set; }
    public DateTimeOffset Created { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Course, GetCouresByStudentIdDto>();
        }
    }
}
