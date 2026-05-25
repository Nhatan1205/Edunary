using Edunary.Application.Common.Interfaces;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Edunary.Application.CourseReviews.Queries.GetCoursePreviewForAdminQuery;

public record GetCoursePreviewForAdminQuery : IRequest<AdminCoursePreviewDto>
{
    public int SubmissionId { get; init; }
}

public class GetCoursePreviewForAdminQueryHandler : IRequestHandler<GetCoursePreviewForAdminQuery, AdminCoursePreviewDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetCoursePreviewForAdminQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<AdminCoursePreviewDto> Handle(GetCoursePreviewForAdminQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var submission = await _context.CourseReviewSubmissions
            .AsNoTracking()
            .Include(s => s.Feedbacks)
            .Include(s => s.Course)
                .ThenInclude(c => c.Category)
            .Include(s => s.Course)
                .ThenInclude(c => c.Topics)
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, cancellationToken);

        Guard.Against.NotFound(request.SubmissionId, submission);

        var course = submission.Course;

        // Fetch instructor info
        var instructor = await _identityService.GetUserById(course.CreatedBy);

        var dto = new AdminCoursePreviewDto
        {
            Course = new CourseInfoDto
            {
                Id = course.Id,
                Title = course.Title,
                Subtitle = course.Subtitle,
                Description = course.Description,
                Level = course.Level,
                Status = course.Status,
                LearningObjectives = course.LearningObjectives,
                Requirements = course.Requirements,
                TargetAudience = course.TargetAudience,
                ImageUrl = course.ImageUrl,
                WelcomeMessage = course.WelcomeMessage,
                CongratulationsMessage = course.CongratulationsMessage,
                Price = course.Price,
                CategoryId = course.CategoryId,
                CategoryTitle = course.Category?.Title,
                Ratings = course.Ratings,
                TotalStudents = course.TotalStudents,
                Content = course.Content,
                LastModified = course.LastModified,
                InstructorId = course.CreatedBy,
                InstructorName = instructor?.FullName,
                InstructorAvatar = instructor?.Avatar,
                Topics = course.Topics.Select(t => new Topics
                {
                    Id = t.Id,
                    Name = t.Name
                }).ToList(),
            },
            SubmissionInfo = new AdminSubmissionInfoDto
            {
                SubmissionId = submission.Id,
                SubmissionNumber = submission.SubmissionNumber,
                Status = submission.Status,
                SubmittedAt = submission.Created,
                AdminNote = submission.AdminNote,
            },
            CurrentFeedbacks = submission.Feedbacks
                .OrderBy(f => f.FeedbackType)
                .Select(f => new AdminFeedbackDto
                {
                    Id = f.Id,
                    FeedbackType = f.FeedbackType,
                    Category = f.Category,
                    Content = f.Content,
                    IsResolved = f.IsResolved,
                })
                .ToList()
        };

        // ── Curriculum sections ───────────────────────────────────────────────
        if (!string.IsNullOrEmpty(course.Content))
        {
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            };

            var curriculumStructure = JsonSerializer.Deserialize<CourseContentSchema>(course.Content, jsonOptions);

            if (curriculumStructure?.Contents != null)
            {
                // Enrich missing thumbnail URLs from MediaFiles (same logic as instructor query)
                var videoIds = curriculumStructure.Contents
                    .SelectMany(s => s.Items)
                    .Where(i => i.VideoId > 0 && string.IsNullOrEmpty(i.ThumbnailUrl))
                    .Select(i => i.VideoId)
                    .Distinct()
                    .ToList();

                if (videoIds.Any())
                {
                    var mediaFiles = await _context.MediaFiles
                        .Where(m => videoIds.Contains(m.Id) && !string.IsNullOrEmpty(m.ThumbnailUrl))
                        .Select(m => new { m.Id, m.ThumbnailUrl })
                        .ToDictionaryAsync(m => m.Id, m => m.ThumbnailUrl, cancellationToken);

                    foreach (var section in curriculumStructure.Contents)
                    {
                        foreach (var item in section.Items)
                        {
                            if (item.VideoId > 0
                                && string.IsNullOrEmpty(item.ThumbnailUrl)
                                && mediaFiles.TryGetValue(item.VideoId, out var thumbUrl))
                            {
                                item.ThumbnailUrl = thumbUrl;
                            }
                        }
                    }
                }

                dto.CurriculumSections = curriculumStructure.Contents;
            }
        }

        return dto;
    }
}
