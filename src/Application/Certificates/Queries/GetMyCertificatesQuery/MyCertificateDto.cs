using AutoMapper;
using Edunary.Domain.Entities;

namespace Edunary.Application.Certificates.Queries.GetMyCertificatesQuery;

public class MyCertificateDto
{
    public string CertificateNumber { get; set; } = string.Empty;
    public string CourseTitleSnapshot { get; set; } = string.Empty;
    public string CourseImageUrl { get; set; } = string.Empty;
    public DateTimeOffset CompletedDate { get; set; }
    public int CourseId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CourseCertificate, MyCertificateDto>()
                .ForMember(d => d.CourseImageUrl, opt => opt.MapFrom(s => s.Course != null ? s.Course.ImageUrl : string.Empty));
        }
    }
}
