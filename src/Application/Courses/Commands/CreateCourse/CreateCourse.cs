using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Courses.EventHandlers;
using Edunary.Domain.Entities;
using Edunary.Domain.Events.Courses;

namespace Edunary.Application.Courses.Commands.CreateCourse;
public record CreateCourseCommand : IRequest<Result>
{
    public string Title { get; init; }
 
    public int CategoryId { get; init; }

    public float Price { get; init; }
}

public class CreateCourseCommandHandler : IRequestHandler<CreateCourseCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public CreateCourseCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(CreateCourseCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var entity = new Course
            {
                Title = request.Title,
                CategoryId = request.CategoryId,
                Price = request.Price,
            };

            entity.AddDomainEvent(new CourseCreatedEvent(entity));

            _context.Courses.Add(entity);

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success("Course created successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred while creating the course: {ex.Message}");
        }
    }
}
