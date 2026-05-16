using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Domain.Events.CourseQuestions;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseQuestions.Commands.CreateCourseQuestionCommand;

public record CreateCourseQuestionCommand : IRequest<ReturnResult<CreatedCourseQuestionDto>>
{
    public int CourseId { get; init; }
    public string ItemId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Detail { get; init; }
}

public class CreateCourseQuestionCommandHandler
    : IRequestHandler<CreateCourseQuestionCommand, ReturnResult<CreatedCourseQuestionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public CreateCourseQuestionCommandHandler(
        IApplicationDbContext context,
        IMapper mapper,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<ReturnResult<CreatedCourseQuestionDto>> Handle(
        CreateCourseQuestionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService.UserId;

            // Allow enrolled students OR anyone with QA access (owner/collaborator)
            var hasQaAccess = await _courseAuth.HasCourseAccessAsync(
                request.CourseId, userId, CoursePermission.QA, cancellationToken);

            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.CourseId == request.CourseId && e.StudentId == userId, cancellationToken);

            if (!isEnrolled && !hasQaAccess)
            {
                return new ReturnResult<CreatedCourseQuestionDto>
                {
                    Result = null,
                    Message = "You must be enrolled in this course to ask a question."
                };
            }

            var question = new CourseQuestion
            {
                CourseId = request.CourseId,
                ItemId = request.ItemId,
                Title = request.Title,
                Detail = request.Detail
            };

            _context.CourseQuestions.Add(question);
            question.AddDomainEvent(new CourseQuestionCreatedEvent(question));
            var result = await _context.SaveChangesAsync(cancellationToken);
            var dto = _mapper.Map<CreatedCourseQuestionDto>(question);

            if (result > 0)
            {
                return new ReturnResult<CreatedCourseQuestionDto> { Result = dto, Message = "Question created." };
            }

            return new ReturnResult<CreatedCourseQuestionDto> { Result = null, Message = "Failed to create question." };
        }
        catch (Exception ex)
        {
            return new ReturnResult<CreatedCourseQuestionDto> { Result = null, Message = ex.Message };
        }
    }
}
