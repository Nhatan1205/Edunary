namespace Edunary.Domain.Entities;

public class CourseAnswer : BaseAuditableEntity
{
    public int QuestionId { get; set; }

    public string Body { get; set; } = string.Empty;

    public bool IsTopAnswer { get; set; }

    public int UpvoteCount { get; set; }

    public CourseQuestion Question { get; set; } = null!;
    public ICollection<AnswerUpvote> Upvotes { get; set; } = new List<AnswerUpvote>();

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

    public void MarkAsTopAnswer()
    {
        IsTopAnswer = true;
    }

    public void UnmarkAsTopAnswer()
    {
        IsTopAnswer = false;
    }
}
