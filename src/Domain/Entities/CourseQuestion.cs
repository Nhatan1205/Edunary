namespace Edunary.Domain.Entities;

public class CourseQuestion : BaseAuditableEntity
{
    public int CourseId { get; set; }

    public string ItemId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Detail { get; set; }

    public int AnswerCount { get; set; }

    public int UpvoteCount { get; set; }

    public bool IsFeatured { get; set; }

    public bool IsRead { get; set; }

    // Navigation
    public Course Course { get; set; } = null!;
    public ICollection<CourseAnswer> Answers { get; set; } = new List<CourseAnswer>();
    public ICollection<QuestionUpvote> Upvotes { get; set; } = new List<QuestionUpvote>();

    // ── Business methods ────────────────────────────────────────────────────

    public void AddAnswer()
    {
        AnswerCount++;
    }

    public void RemoveAnswer()
    {
        if (AnswerCount > 0)
        {
            AnswerCount--;
        }
    }

    public void AddUpvote()
    {
        UpvoteCount++;
    }

    public void RemoveUpvote()
    {
        if (UpvoteCount > 0)
        {
            UpvoteCount--;
        }
    }

    public void MarkAsFeatured()
    {
        IsFeatured = true;
    }

    public void UnmarkAsFeatured()
    {
        IsFeatured = false;
    }

    public void MarkAsRead()
    {
        IsRead = true;
    }

    public void MarkAsUnread()
    {
        IsRead = false;
    }
}
