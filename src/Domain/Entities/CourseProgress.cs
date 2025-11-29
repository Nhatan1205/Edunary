using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Domain.Entities;

public class CourseProgress : BaseAuditableEntity
{
    public int CourseId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string Progress { get; set; } = string.Empty;

    public Course Course { get; set; } = null!;
}
