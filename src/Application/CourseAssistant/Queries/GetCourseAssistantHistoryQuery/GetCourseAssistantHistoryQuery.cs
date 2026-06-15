using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Text.Json;

namespace Edunary.Application.CourseAssistant.Queries.GetCourseAssistantHistoryQuery;

public record GetCourseAssistantHistoryQuery : IRequest<ReturnResult<CourseAssistantHistoryDto>>
{
    public int CourseId { get; init; }
    public string Cursor { get; init; }       
    public int PageSize { get; init; } = 20;
}

public class GetCourseAssistantHistoryQueryHandler
    : IRequestHandler<GetCourseAssistantHistoryQuery, ReturnResult<CourseAssistantHistoryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAICenterClient _aiCenterClient;
    private readonly ISender _sender;

    public GetCourseAssistantHistoryQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IAICenterClient aiCenterClient,
        ISender sender)
    {
        _context = context;
        _currentUserService = currentUserService;
        _aiCenterClient = aiCenterClient;
        _sender = sender;
    }

    public async Task<ReturnResult<CourseAssistantHistoryDto>> Handle(
        GetCourseAssistantHistoryQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService.UserId;

            // Verify enrollment
            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.CourseId == request.CourseId && e.StudentId == userId, cancellationToken);

            if (!isEnrolled)
            {
                return new ReturnResult<CourseAssistantHistoryDto>
                {
                    Result = null,
                    Message = "You are not enrolled in this course."
                };
            }

            var aiConfig = await _sender.Send(new GetAIConfigQuery(), cancellationToken);

            if (string.IsNullOrEmpty(aiConfig.AICenterBaseUrl))
            {
                return new ReturnResult<CourseAssistantHistoryDto>
                {
                    Result = new CourseAssistantHistoryDto { Items = new List<CourseAssistantMessageDto>(), HasMore = false },
                    Message = "AI Center not configured."
                };
            }

            // POST to AI Center history endpoint
            var payload = new
            {
                user_id = userId,
                course_id = request.CourseId,
                cursor = request.Cursor,
                page_size = request.PageSize
            };

            var url = $"{aiConfig.AICenterBaseUrl}api/course-assistant/history";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload), cancellationToken);

            if (!isSuccess)
            {
                return new ReturnResult<CourseAssistantHistoryDto>
                {
                    Result = null,
                    Message = "Failed to load conversation history."
                };
            }

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
                PropertyNameCaseInsensitive = true
            };

            var history = JsonSerializer.Deserialize<CourseAssistantHistoryDto>(body, options);

            return new ReturnResult<CourseAssistantHistoryDto>
            {
                Result = history,
                Message = "Success"
            };
        }
        catch (Exception ex)
        {
            return new ReturnResult<CourseAssistantHistoryDto>
            {
                Result = null,
                Message = ex.Message
            };
        }
    }
}
