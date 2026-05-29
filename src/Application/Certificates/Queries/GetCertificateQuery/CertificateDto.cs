using AutoMapper;
using Edunary.Domain.Entities;

namespace Edunary.Application.Certificates.Queries.GetCertificateQuery;

public class CertificateDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public DateTimeOffset CompletedDate { get; set; }
    public string CourseTitleSnapshot { get; set; } = string.Empty;
    public string InstructorNameSnapshot { get; set; } = string.Empty;
    public string StudentNameSnapshot { get; set; } = string.Empty;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CourseCertificate, CertificateDto>();
        }
    }
}
