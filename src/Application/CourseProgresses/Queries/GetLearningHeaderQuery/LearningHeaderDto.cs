using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Application.CourseProgresses.Queries.GetLearningHeaderQuery;

public class LearningHeaderDto
{
    public string Title { get; set; }
    public int TotalLectures { get; set; }
    public int CompletedLectures { get; set; }
}
