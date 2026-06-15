using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Edunary.Application.CourseAssistant.Commands.SendCourseAssistantMessageCommand;

public record SendCourseAssistantMessageCommand : IRequest<ReturnResult<CourseAssistantReplyDto>>
{
    public int CourseId { get; init; }
    public string ContentId { get; init; }
    public string ContentType { get; init; }
    public string MediaType { get; init; }
    public string ContentTitle { get; init; }
    public string Message { get; init; }
}

public class SendCourseAssistantMessageCommandHandler
    : IRequestHandler<SendCourseAssistantMessageCommand, ReturnResult<CourseAssistantReplyDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAssistantJobService _courseAssistantJobService;

    public SendCourseAssistantMessageCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAssistantJobService courseAssistantJobService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAssistantJobService = courseAssistantJobService;
    }

    public async Task<ReturnResult<CourseAssistantReplyDto>> Handle(
        SendCourseAssistantMessageCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService.UserId;

            // 1. Verify enrollment
            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.CourseId == request.CourseId && e.StudentId == userId, cancellationToken);

            if (!isEnrolled)
            {
                return new ReturnResult<CourseAssistantReplyDto>
                {
                    Result = null,
                    Message = "You are not enrolled in this course."
                };
            }

            // 2. Queue background job
            _courseAssistantJobService.EnqueueCourseAssistantMessage(
                userId,
                request.CourseId,
                request.ContentId,
                request.ContentType,
                request.MediaType,
                request.ContentTitle,
                request.Message);

            return new ReturnResult<CourseAssistantReplyDto>
            {
                Result = new CourseAssistantReplyDto
                {
                    Reply = "Queued",
                    MessageType = "text",
                    Sources = new List<string>()
                },
                Message = "Success"
            };
        }
        catch (System.Exception ex)
        {
            return new ReturnResult<CourseAssistantReplyDto>
            {
                Result = null,
                Message = ex.Message
            };
        }
    }
}
