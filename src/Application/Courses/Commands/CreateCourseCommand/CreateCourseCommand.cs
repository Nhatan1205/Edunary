using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
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
    private readonly IMapper _mapper;

    public CreateCourseCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;

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

            var result = await _context.SaveChangesAsync(cancellationToken);

            var dto = _mapper.Map<CreatedCourseDto>(entity);

            if(result > 0)
            {
                return Result.Success(dto, "Course created successfully");
            }
            return Result.Failure("course create unsuccessfully");
        }
        catch (Exception ex) { 
            return Result.Failure($"An unexpected error occurred while creating course: {ex.Message}");
        }

    }
}
