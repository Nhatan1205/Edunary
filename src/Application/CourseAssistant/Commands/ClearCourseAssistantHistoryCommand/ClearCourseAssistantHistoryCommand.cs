using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Edunary.Application.CourseAssistant.Commands.ClearCourseAssistantHistoryCommand;

public record ClearCourseAssistantHistoryCommand : IRequest<Result>
{
    public int CourseId { get; init; }
}

public class ClearCourseAssistantHistoryCommandHandler
    : IRequestHandler<ClearCourseAssistantHistoryCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAICenterClient _aiCenterClient;
    private readonly ISender _sender;

    public ClearCourseAssistantHistoryCommandHandler(
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

    public async Task<Result> Handle(
        ClearCourseAssistantHistoryCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService.UserId;

            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.CourseId == request.CourseId && e.StudentId == userId, cancellationToken);

            if (!isEnrolled)
            {
                return Result.Failure("You are not enrolled in this course.");
            }

            var aiConfig = await _sender.Send(new GetAIConfigQuery(), cancellationToken);

            if (string.IsNullOrEmpty(aiConfig.AICenterBaseUrl))
            {
                return Result.Failure("AI Center is not configured.");
            }

            var payload = new
            {
                user_id = userId,
                course_id = request.CourseId
            };

            var url = $"{aiConfig.AICenterBaseUrl}api/course-assistant/clear";
            var (isSuccess, _) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload), cancellationToken);

            return isSuccess
                ? Result.Success("Conversation cleared successfully.")
                : Result.Failure("Failed to clear conversation.");
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
