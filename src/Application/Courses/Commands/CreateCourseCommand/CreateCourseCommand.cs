using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.InteropServices.JavaScript;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Courses.EventHandlers;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
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
                Status = CourseStatus.Draft
            };

            entity.AddDomainEvent(new CourseCreatedEvent(entity));

            _context.Courses.Add(entity);

            var result = await _context.SaveChangesAsync(cancellationToken);

            StreamReader reader = new StreamReader(string.Concat(Environment.CurrentDirectory, "/sampletemplate/createDefaultCourseContent.json"));
            string sampleText = reader.ReadToEnd();
            var createDefaultContent = JsonSerializer.Deserialize<JsonElement>(sampleText);
            var courseContent = new
            {
                id = entity.Id.ToString(),   
                title = entity.Title,
                contents = new[] { createDefaultContent },
                nextSectionId = 2,
                nextItemId = 2
            };
            string contentJsonToSave = JsonSerializer.Serialize(courseContent);
            entity.Content = contentJsonToSave;
            await _context.SaveChangesAsync(cancellationToken);

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
