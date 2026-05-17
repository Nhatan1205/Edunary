using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Assignments.Commands.CreateAssignmentCommand;

public record CreateAssignmentCommand : IRequest<ReturnResult<int>>
{
    public int CourseId { get; init; }
    public string ItemId { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Instructions { get; init; } = string.Empty;
    public int EstimatedDurationMinutes { get; init; }
}

public class CreateAssignmentCommandHandler : IRequestHandler<CreateAssignmentCommand, ReturnResult<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateAssignmentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ReturnResult<int>> Handle(CreateAssignmentCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == request.CourseId && c.CreatedBy == _currentUserService.UserId, cancellationToken);

            if (course == null)
            {
                return new ReturnResult<int> { Result = 0, Message = "Course not found or access denied." };
            }

            bool exists = await _context.Assignments
                .AnyAsync(a => a.CourseId == request.CourseId && a.ItemId == request.ItemId, cancellationToken);

            if (exists)
            {
                return new ReturnResult<int> { Result = 0, Message = "An assignment already exists for this item." };
            }

            var assignment = new Assignment
            {
                CourseId = request.CourseId,
                ItemId = request.ItemId,
                Title = request.Title,
                Description = request.Description,
                Instructions = request.Instructions,
                EstimatedDurationMinutes = request.EstimatedDurationMinutes,
                IsPublished = false
            };

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync(cancellationToken);

            return new ReturnResult<int> { Result = assignment.Id, Message = "Assignment created successfully." };
        }
        catch (Exception ex)
        {
            return new ReturnResult<int> { Result = 0, Message = $"An error occurred: {ex.Message}" };
        }
    }
}
