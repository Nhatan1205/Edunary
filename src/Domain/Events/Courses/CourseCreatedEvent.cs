using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Edunary.Domain.Events.Courses;
public class CourseCreatedEvent : BaseEvent
{
    public CourseCreatedEvent(Course item)
    {
        Item = item;
    }
    public Course Item { get; }
}
