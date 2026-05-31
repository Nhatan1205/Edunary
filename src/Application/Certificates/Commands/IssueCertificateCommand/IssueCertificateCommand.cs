using Edunary.Application.Certificates.Queries.GetCertificateQuery;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Constants;
using Edunary.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;
using AutoMapper;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;
using Microsoft.Extensions.Options;

namespace Edunary.Application.Certificates.Commands.IssueCertificateCommand;

public class IssueCertificateCommand : IRequest<ReturnResult<CertificateDto>>
{
    public int CourseId { get; init; }
}

public class IssueCertificateCommandHandler : IRequestHandler<IssueCertificateCommand, ReturnResult<CertificateDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotifyService _notifyService;
    private readonly IEmailService _emailService;
    private readonly IIdentityService _identityService;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public IssueCertificateCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        INotifyService notifyService,
        IEmailService emailService,
        IIdentityService identityService,
        IMapper mapper,
        IOptions<AppSettings> appSettings)
    {
        _context = context;
        _currentUserService = currentUserService;
        _notifyService = notifyService;
        _emailService = emailService;
        _identityService = identityService;
        _mapper = mapper;
        _appSettings = appSettings.Value;
    }

    public async Task<ReturnResult<CertificateDto>> Handle(IssueCertificateCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var userName = _currentUserService.FullName ?? _currentUserService.UserName;

        var enrollment = await _context.Enrollments
            .Include(e => e.Course)
            .FirstOrDefaultAsync(e => e.CourseId == request.CourseId && e.StudentId == userId, cancellationToken);

        if (enrollment == null)
        {
            return new ReturnResult<CertificateDto> { Result = null!, Message = "You must be enrolled to earn a certificate." };
        }

        var course = enrollment.Course;

        var existingCert = await _context.CourseCertificates
            .FirstOrDefaultAsync(c => c.CourseId == request.CourseId && c.StudentId == userId, cancellationToken);

        if (existingCert != null)
        {
            return new ReturnResult<CertificateDto> { Result = _mapper.Map<CertificateDto>(existingCert), Message = "Success" };
        }

        var courseProgress = await _context.CourseProgress
            .FirstOrDefaultAsync(cp => cp.CourseId == request.CourseId && cp.StudentId == userId, cancellationToken);

        if (courseProgress == null)
        {
            return new ReturnResult<CertificateDto> { Result = null!, Message = "No progress found for this course." };
        }

        var options = new JsonSerializerOptions 
        { 
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull 
        };
        var content = JsonSerializer.Deserialize<CourseContentSchema>(courseProgress.Progress, options);

        if (content == null || content.Contents == null)
        {
             return new ReturnResult<CertificateDto> { Result = null!, Message = "Course content is empty." };
        }

        int totalRequired = 0;
        int completed = 0;

        foreach (var section in content.Contents)
        {
            if (section.Items == null) continue;
            foreach (var item in section.Items)
            {
                if (item.Type == "lecture" || item.Type == "quiz")
                {
                    totalRequired++;
                    if (item.IsCompleted)
                    {
                        completed++;
                    }
                }
            }
        }

        if (totalRequired == 0 || completed < totalRequired)
        {
            return new ReturnResult<CertificateDto> { Result = null!, Message = "You have not completed all lectures and quizzes in this course." };
        }

        var randomStr = Path.GetRandomFileName().Replace(".", "").Substring(0, 8).ToUpper();
        var certNum = $"UC-{DateTime.UtcNow.Year}-{randomStr}";

        var instructorName = await _identityService.GetFullNameAsync(course.CreatedBy);
        if (string.IsNullOrEmpty(instructorName)) instructorName = "Instructor";

        var cert = new CourseCertificate
        {
            CourseId = course.Id,
            StudentId = userId,
            CertificateNumber = certNum,
            CompletedDate = DateTimeOffset.UtcNow,
            CourseTitleSnapshot = course.Title,
            InstructorNameSnapshot = instructorName,
            StudentNameSnapshot = userName
        };

        _context.CourseCertificates.Add(cert);
        await _context.SaveChangesAsync(cancellationToken);

        await _notifyService.NotifyUserAsync(
            userId,
            "🎓 Certificate Earned!",
            $"Congratulations! You've completed \"{course.Title}\".",
            "certificate_issued",
            new { CertificateNumber = cert.CertificateNumber },
            cancellationToken,
            course.Id,
            $"/course/{course.Id}/learn",
            course.ImageUrl
        );

        var userEmail = _currentUserService.Email;
        if (!string.IsNullOrEmpty(userEmail))
        {
            var emailBody = EmailTemplates.BuildCertificateIssuedTemplate(
                userName, 
                course.Title, 
                cert.CertificateNumber, 
                $"{_appSettings.ClientUrl}/certificate/verify/{cert.CertificateNumber}");
            
            await _emailService.SendBulkEmailsAsync(new List<string> { userEmail }, $"Congratulations! You've completed \"{course.Title}\"", emailBody);
        }

        return new ReturnResult<CertificateDto> { Result = _mapper.Map<CertificateDto>(cert), Message = "Success" };
    }
}
