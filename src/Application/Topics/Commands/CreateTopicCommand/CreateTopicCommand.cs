using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
namespace Edunary.Application.Topics.Commands.CreateTopicCommand;
public record CreateTopicCommand : IRequest<ReturnResult<CreatedTopicDto>>
{
    public string Name { get; init; } = null!;
}

public class CreateTopicCommandHandler : IRequestHandler<CreateTopicCommand, ReturnResult<CreatedTopicDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateTopicCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ReturnResult<CreatedTopicDto>> Handle(CreateTopicCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var exists = await _context.Topics
                .AnyAsync(t => t.Name.ToLower() == request.Name.Trim().ToLower(), cancellationToken);

            if (exists)
            {
                return new ReturnResult<CreatedTopicDto>
                {
                    Result = null,
                    Message = $"Topic '{request.Name}' already exists."
                };
            }

            var entity = new Topic { Name = request.Name.Trim() };
            _context.Topics.Add(entity);
            var result = await _context.SaveChangesAsync(cancellationToken);

            if (result > 0)
            {
                return new ReturnResult<CreatedTopicDto>
                {
                    Result = _mapper.Map<CreatedTopicDto>(entity),
                    Message = "Course topic created successfully."
                };
            }

            return new ReturnResult<CreatedTopicDto> { Result = null, Message = "Course topic creation failed." };
        }
        catch (Exception ex)
        {
            return new ReturnResult<CreatedTopicDto> { Result = null, Message = $"An unexpected error occurred: {ex.Message}" };
        }
    }
}
