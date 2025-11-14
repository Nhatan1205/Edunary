using Edunary.Application.Common.Models;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.CourseContents.Commands.UnsetCourseIdForAllContentsCommand;

public class UnsetCourseIdForAllContentsCommand : IRequest<Result>
{
    public int CourseId { get; set; }
}

public class UnsetCourseIdForAllContentsCommandHandler : IRequestHandler<UnsetCourseIdForAllContentsCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UnsetCourseIdForAllContentsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(UnsetCourseIdForAllContentsCommand request, CancellationToken cancellationToken)
    {
        var contents = await _context.CourseContents
            .Where(c => c.CourseId == request.CourseId)
            .ToListAsync(cancellationToken);

        if (!contents.Any())
        {
            return Result.Success("No contents found for this course.");
        }

        foreach (var content in contents)
        {
            content.CourseId = null;
        }

        var result = await _context.SaveChangesAsync(cancellationToken);
        
        if (result > 0)
        {
            return Result.Success($"Successfully released {contents.Count} content(s) from course ID {request.CourseId}.");
        }
        else
        {
            return Result.Failure("Failed to unset course ID for contents.");
        }
    }
}
