using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Domain.Events.CourseAnswers;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseAnswers.Commands.CreateCourseAnswerCommand;

public record CreateCourseAnswerCommand : IRequest<ReturnResult<CreatedCourseAnswerDto>>
{
    public int QuestionId { get; init; }
    public string Body { get; init; } = string.Empty;
}

public class CreateCourseAnswerCommandHandler : IRequestHandler<CreateCourseAnswerCommand, ReturnResult<CreatedCourseAnswerDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public CreateCourseAnswerCommandHandler(
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

    public async Task<ReturnResult<CreatedCourseAnswerDto>> Handle(
        CreateCourseAnswerCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var question = await _context.CourseQuestions
                .FirstOrDefaultAsync(q => q.Id == request.QuestionId, cancellationToken);

            Guard.Against.NotFound(request.QuestionId, question);

            var userId = _currentUserService.UserId;

            // Allow enrolled students OR anyone with QA access (owner/collaborator)
            var hasQaAccess = await _courseAuth.HasCourseAccessAsync(
                question.CourseId, userId, CoursePermission.QA, cancellationToken);

            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.CourseId == question.CourseId && e.StudentId == userId, cancellationToken);

            if (!isEnrolled && !hasQaAccess)
            {
                return new ReturnResult<CreatedCourseAnswerDto>
                {
                    Result = null,
                    Message = "You must be enrolled in this course to post an answer."
                };
            }

            var answer = new CourseAnswer
            {
                QuestionId = request.QuestionId,
                Body = request.Body,
                IsTopAnswer = false,
                UpvoteCount = 0
            };

            _context.CourseAnswers.Add(answer);
            question.AddAnswer();
            answer.AddDomainEvent(new CourseAnswerCreatedEvent(answer));
            var result = await _context.SaveChangesAsync(cancellationToken);
            var dto = _mapper.Map<CreatedCourseAnswerDto>(answer);

            if (result > 0)
            {
                return new ReturnResult<CreatedCourseAnswerDto> { Result = dto, Message = "Answer posted." };
            }

            return new ReturnResult<CreatedCourseAnswerDto> { Result = null, Message = "Failed to post answer." };
        }
        catch (Exception ex)
        {
            return new ReturnResult<CreatedCourseAnswerDto> { Result = null, Message = ex.Message };
        }
    }
}
