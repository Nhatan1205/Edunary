using AutoMapper;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.CourseReviews.Queries.GetCourseReviewStatusQuery;

public class CourseReviewStatusDto
{
    public int CourseId { get; set; }
    public CourseStatus CourseStatus { get; set; }
    public LatestSubmissionDto LatestSubmission { get; set; }
    public List<SubmissionHistoryItemDto> SubmissionHistory { get; set; } = new();
}

public class LatestSubmissionDto
{
    public int Id { get; set; }
    public int SubmissionNumber { get; set; }
    public ReviewSubmissionStatus Status { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string AdminNote { get; set; }
    public List<FeedbackItemDto> Feedbacks { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CourseReviewSubmission, LatestSubmissionDto>()
                .ForMember(d => d.Feedbacks, opt => opt.MapFrom(s => s.Feedbacks.OrderBy(f => f.FeedbackType)));
        }
    }
}

public class FeedbackItemDto
{
    public int Id { get; set; }
    public ReviewFeedbackType FeedbackType { get; set; }
    public ReviewFeedbackCategory Category { get; set; }
    public string Content { get; set; }
    public bool IsResolved { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CourseReviewFeedback, FeedbackItemDto>();
        }
    }
}

public class SubmissionHistoryItemDto
{
    public int SubmissionNumber { get; set; }
    public ReviewSubmissionStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string AdminNote { get; set; }
    public List<FeedbackItemDto> Feedbacks { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CourseReviewSubmission, SubmissionHistoryItemDto>()
                .ForMember(d => d.CreatedAt, opt => opt.MapFrom(s => s.Created))
                .ForMember(d => d.Feedbacks, opt => opt.MapFrom(s => s.Feedbacks.OrderBy(f => f.FeedbackType)));
        }
    }
}
