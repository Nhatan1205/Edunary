using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.CourseReviews.Services;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Queries.GetCourseChangesComparisonQuery;

public record GetCourseChangesComparisonQuery : IRequest<ComparisonResultDto>
{
    public int CourseId { get; init; }
}

public class GetCourseChangesComparisonQueryValidator : AbstractValidator<GetCourseChangesComparisonQuery>
{
    public GetCourseChangesComparisonQueryValidator()
    {
        RuleFor(x => x.CourseId)
            .GreaterThan(0)
            .WithMessage("CourseId must be greater than 0.");
    }
}

public class GetCourseChangesComparisonQueryHandler : IRequestHandler<GetCourseChangesComparisonQuery, ComparisonResultDto>
{
    private readonly IApplicationDbContext _context;

    public GetCourseChangesComparisonQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ComparisonResultDto> Handle(GetCourseChangesComparisonQuery request, CancellationToken cancellationToken)
    {
        var course = await _context.Courses
            .Include(c => c.MediaFiles.Where(m => !m.IsDeleted))
            .Include(c => c.Topics)
            .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);

        Guard.Against.NotFound(request.CourseId, course);

        var quizzes = await _context.Quizzes
            .Where(q => q.CourseId == request.CourseId)
            .Include(q => q.Questions)
                .ThenInclude(q => q.Choices)
            .ToListAsync(cancellationToken);

        var assignments = await _context.Assignments
            .Where(a => a.CourseId == request.CourseId)
            .Include(a => a.Questions)
            .ToListAsync(cancellationToken);

        var snapshot = await _context.CourseApprovedSnapshots
            .Include(s => s.Submission)
            .Where(s => s.CourseId == request.CourseId)
            .OrderByDescending(s => s.Created)
            .FirstOrDefaultAsync(cancellationToken);

        var categories = await _context.Categories.ToListAsync(cancellationToken);
        var topics = await _context.Topics.ToListAsync(cancellationToken);

        var comparer = new CourseChangeComparer();
        var result = comparer.Compare(snapshot, course, course.MediaFiles.ToList(), quizzes, assignments, course.Topics.ToList(), categories, topics);
        result.CourseTitle = course.Title;
        result.CourseSubtitle = course.Subtitle;
        result.CourseImageUrl = course.ImageUrl;
        return result;
    }
}
