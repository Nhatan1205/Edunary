using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.MediaFiles.Commands.SetCourseIdForContentCommand;

public class SetCourseIdForContentCommand : IRequest<Result>
{
    public List<int> ContentIds { get; set; } = new();
    public int? CourseId { get; set; }
}

public class SetCourseIdForContentCommandHandler : IRequestHandler<SetCourseIdForContentCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public SetCourseIdForContentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(SetCourseIdForContentCommand request, CancellationToken cancellationToken)
    {
        if (request.ContentIds == null || !request.ContentIds.Any())
        {
            return Result.Failure("No content IDs provided.");
        }

        var contents = await _context.MediaFiles
            .Where(c => request.ContentIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

        if (!contents.Any())
        {
            return Result.Failure("No contents found with the provided IDs.");
        }

        foreach (var content in contents)
        {
            content.CourseId = request.CourseId;
            if (content.IsDeleted == true && request.CourseId != null)
            {
                content.IsDeleted = false;
            }
        }

        var result = await _context.SaveChangesAsync(cancellationToken);
        
        if (result > 0)
        {
            return Result.Success($"Course ID set successfully for {contents.Count} content(s).");
        }
        else
        {
            return Result.Success("No content was updated because the Course ID was already set.");
        }
    }
}
