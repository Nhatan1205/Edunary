using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.CourseTopics.Commands.CreateCourseTopic;

public record CreateCourseTopicCommand : IRequest<ReturnResult<CreatedCourseTopicDto>>
{
    public string Name { get; init; } = null!;
}

public class CreateCourseTopicCommandHandler : IRequestHandler<CreateCourseTopicCommand, ReturnResult<CreatedCourseTopicDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateCourseTopicCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ReturnResult<CreatedCourseTopicDto>> Handle(CreateCourseTopicCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var exists = await _context.CourseTopics
                .AnyAsync(t => t.Name.ToLower() == request.Name.Trim().ToLower(), cancellationToken);

            if (exists)
            {
                return new ReturnResult<CreatedCourseTopicDto>
                {
                    Result = null,
                    Message = $"Topic '{request.Name}' already exists."
                };
            }

            var entity = new CourseTopic { Name = request.Name.Trim() };
            _context.CourseTopics.Add(entity);
            var result = await _context.SaveChangesAsync(cancellationToken);

            if (result > 0)
            {
                return new ReturnResult<CreatedCourseTopicDto>
                {
                    Result = _mapper.Map<CreatedCourseTopicDto>(entity),
                    Message = "Course topic created successfully."
                };
            }

            return new ReturnResult<CreatedCourseTopicDto> { Result = null, Message = "Course topic creation failed." };
        }
        catch (Exception ex)
        {
            return new ReturnResult<CreatedCourseTopicDto> { Result = null, Message = $"An unexpected error occurred: {ex.Message}" };
        }
    }
}
