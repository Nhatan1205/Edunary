using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Edunary.Domain.Entities;
public class Category : BaseAuditableEntity
{
    public string Title { get; set; }

    public IList<Course> Courses { get; private set; } = new List<Course>();
}
