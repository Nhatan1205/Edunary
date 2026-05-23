using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.CourseReviews.Commands.SubmitCourseForReviewCommand;

public class SubmittedReviewDto
{
    public int SubmissionId { get; set; }
    public int SubmissionNumber { get; set; }
    public ReviewSubmissionStatus Status { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CourseReviewSubmission, SubmittedReviewDto>();
        }
    }
}
