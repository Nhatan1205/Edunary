using Edunary.Application.Certificates.Commands.IssueCertificateCommand;
using Edunary.Application.Certificates.Queries.GetCertificateQuery;
using Edunary.Application.Certificates.Queries.GetMyCertificatesQuery;
using Edunary.Application.Certificates.Queries.DownloadCertificatePdfQuery;
using Edunary.Application.Certificates.Queries.VerifyCertificateQuery;
using Edunary.Application.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class Certificates : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapPost(IssueCertificate, "")
            .MapGet(GetCertificate, "")
            .MapGet(GetMyCertificates, "my")
            .MapGet(VerifyCertificate, "verify/{certificateNumber}")
            .MapGet(DownloadCertificate, "download/{certificateNumber}");
    }

    public async Task<ReturnResult<CertificateDto>> IssueCertificate(ISender sender, [FromBody] IssueCertificateCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<CertificateDto> GetCertificate(ISender sender, [FromQuery] int courseId)
    {
        return await sender.Send(new GetCertificateQuery { CourseId = courseId });
    }

    public async Task<PaginatedList<MyCertificateDto>> GetMyCertificates(ISender sender, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        return await sender.Send(new GetMyCertificatesQuery { PageNumber = pageNumber, PageSize = pageSize });
    }

    public async Task<VerifyCertificateDto> VerifyCertificate(ISender sender, string certificateNumber)
    {
        return await sender.Send(new VerifyCertificateQuery { CertificateNumber = certificateNumber });
    }

    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IResult> DownloadCertificate(ISender sender, string certificateNumber)
    {
        var result = await sender.Send(new DownloadCertificatePdfQuery { CertificateNumber = certificateNumber });
        if (result == null)
            return Results.NotFound();

        return Results.File(result, "application/pdf", $"Certificate_{certificateNumber}.pdf");
    }
}
