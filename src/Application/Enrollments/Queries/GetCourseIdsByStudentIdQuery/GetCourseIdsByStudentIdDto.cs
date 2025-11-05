using Edunary.Application.Enrollments.Queries.GetCoursesByStudentIdQuery;
using Edunary.Domain.Entities;

namespace Edunary.Application.Enrollments.Queries.GetCourseIdsByStudentIdQuery;
public class GetCourseIdsByStudentIdDto
{
    public int Id { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<int, GetCourseIdsByStudentIdDto>()
                .ForMember(d => d.Id, opt => opt.MapFrom(s => s));
        }
    }
}
