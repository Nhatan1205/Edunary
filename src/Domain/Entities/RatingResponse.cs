using Edunary.Domain.Common;

namespace Edunary.Domain.Entities;

public class RatingResponse : BaseAuditableEntity
{

    public int RatingCourseId { get; set; }
    public string ResponseText { get; set; }

    // Navigation property
    public RatingCourse RatingCourse { get; set; }
}
