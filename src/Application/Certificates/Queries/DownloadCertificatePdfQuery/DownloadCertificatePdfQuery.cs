using Edunary.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Edunary.Domain.Common;
using Microsoft.Extensions.Options;

namespace Edunary.Application.Certificates.Queries.DownloadCertificatePdfQuery;

public class DownloadCertificatePdfQuery : IRequest<byte[]>
{
    public string CertificateNumber { get; init; } = string.Empty;
}

public class DownloadCertificatePdfQueryHandler : IRequestHandler<DownloadCertificatePdfQuery, byte[]>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly AppSettings _appSettings;

    public DownloadCertificatePdfQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService, IOptions<AppSettings> appSettings)
    {
        _context = context;
        _currentUserService = currentUserService;
        _appSettings = appSettings.Value;
    }

    public async Task<byte[]> Handle(DownloadCertificatePdfQuery request, CancellationToken cancellationToken)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var cert = await _context.CourseCertificates
            .FirstOrDefaultAsync(c => c.CertificateNumber == request.CertificateNumber && c.StudentId == _currentUserService.UserId, cancellationToken);

        if (cert == null) return null!;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(1, QuestPDF.Infrastructure.Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(14).FontColor(Colors.Black));

                // Borders
                page.Background().Layers(layers =>
                {
                    layers.PrimaryLayer()
                        .Padding(0.5f, QuestPDF.Infrastructure.Unit.Centimetre)
                        .Border(8)
                        .BorderColor("#00A76F");
                    
                    layers.Layer()
                        .Padding(0.7f, QuestPDF.Infrastructure.Unit.Centimetre)
                        .Border(2)
                        .BorderColor("#00A76F");
                });

                page.Content().PaddingVertical(1.5f, QuestPDF.Infrastructure.Unit.Centimetre).PaddingHorizontal(2.5f, QuestPDF.Infrastructure.Unit.Centimetre).Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().AlignLeft().Text("Edunary").FontSize(32).Bold().FontColor("#00A76F");
                        row.RelativeItem().AlignRight().Text($"Verify at: {_appSettings.ClientUrl}/certificate/verify").FontSize(10).FontColor(Colors.Grey.Medium);
                    });

                    col.Item().PaddingTop(15).AlignCenter().Text("CERTIFICATE OF COMPLETION")
                        .FontSize(42)
                        .ExtraBold()
                        .FontColor("#00A76F");

                    col.Item().PaddingTop(10).AlignCenter().Text("This is to proudly certify that")
                        .FontSize(20)
                        .FontColor(Colors.Grey.Medium)
                        .Italic();

                    col.Item().PaddingTop(15).AlignCenter().Text(cert.StudentNameSnapshot)
                        .FontSize(48)
                        .Bold()
                        .FontColor(Colors.Black);

                    col.Item().PaddingTop(15).AlignCenter().Text("has successfully completed the course")
                        .FontSize(20)
                        .FontColor(Colors.Grey.Medium)
                        .Italic();

                    col.Item().PaddingTop(10).AlignCenter().Text(cert.CourseTitleSnapshot)
                        .FontSize(32)
                        .SemiBold()
                        .FontColor("#212B36");
                        
                    col.Item().PaddingTop(40).Row(row =>
                    {
                        row.RelativeItem().AlignLeft().AlignBottom().Column(c =>
                        {
                            c.Item().Text($"Date: {cert.CompletedDate.ToString("MMMM dd, yyyy")}").FontSize(16).SemiBold();
                            c.Item().Text($"Certificate ID: {cert.CertificateNumber}").FontSize(14).FontColor(Colors.Grey.Medium);
                        });
                        
                        row.RelativeItem().AlignRight().AlignBottom().Column(c =>
                        {
                            c.Item().Width(250).AlignCenter().Text(cert.InstructorNameSnapshot).FontSize(28).Italic().FontColor("#00A76F");
                            c.Item().Width(250).LineHorizontal(1.5f).LineColor(Colors.Black);
                            c.Item().PaddingTop(5).Width(250).AlignCenter().Text("Instructor").FontSize(16).FontColor(Colors.Grey.Darken2);
                        });
                    });
                });
            });
        });

        return document.GeneratePdf();
    }
}
