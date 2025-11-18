using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Domain.Entities;
public class CourseContent : BaseAuditableEntity
{
    public string UserId { get; set; }
    public string FileName { get; set; }
    public string FileUrl { get; set; }
    public string ContentType { get; set; }
    public int? CourseId { get; set; } 

    // Navigation properties
    #nullable enable
    public Course? Course { get; set; }
}