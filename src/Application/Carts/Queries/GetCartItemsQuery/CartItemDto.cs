namespace Edunary.Application.Carts.Queries.GetCartItemsQuery;

public class CartItemDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string ImageUrl { get; set; }
    public string InstructorName { get; set; }
    public float Price { get; set; }
    public float Rating { get; set; }
    public int ReviewCount { get; set; }
    public string Level { get; set; }
    public int TotalLectures { get; set; }
    public float TotalHours { get; set; }
}
