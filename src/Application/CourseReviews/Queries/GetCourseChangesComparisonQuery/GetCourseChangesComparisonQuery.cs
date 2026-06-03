using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.CourseReviews.Services;
using Edunary.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

using Edunary.Application.Common.Behaviours;
using Edunary.Domain.Enums;

namespace Edunary.Application.CourseReviews.Queries.GetCourseChangesComparisonQuery;

[ActivityLog(ActivityType.ViewCourseChanges, "View Course Changes")]
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

        var categories = new List<Category>();
        var topicsToPass = course.Topics.ToList();

        if (snapshot != null)
        {
            if (snapshot.CategoryId != course.CategoryId)
            {
                var categoryIds = new List<int> { snapshot.CategoryId, course.CategoryId }
                    .Distinct()
                    .ToList();

                categories = await _context.Categories
                    .Where(c => categoryIds.Contains(c.Id))
                    .ToListAsync(cancellationToken);
            }

            var oldTopicIds = new List<int>();
            if (!string.IsNullOrEmpty(snapshot.TopicIds))
            {
                try
                {
                    oldTopicIds = JsonSerializer.Deserialize<List<int>>(snapshot.TopicIds) ?? new List<int>();
                }
                catch
                {
                }
            }

            var newTopicIds = course.Topics.Select(t => t.Id).ToList();
            var removedTopicIds = oldTopicIds.Except(newTopicIds).ToList();

            if (removedTopicIds.Any())
            {
                var removedTopics = await _context.Topics
                    .Where(t => removedTopicIds.Contains(t.Id))
                    .ToListAsync(cancellationToken);

                topicsToPass = topicsToPass.Concat(removedTopics).ToList();
            }
        }

        var comparer = new CourseChangeComparer();
        var result = comparer.Compare(snapshot, course, course.MediaFiles.ToList(), quizzes, assignments, course.Topics.ToList(), categories, topicsToPass);
        result.CourseTitle = course.Title;
        result.CourseSubtitle = course.Subtitle;
        result.CourseImageUrl = course.ImageUrl;
        return result;
    }
}
