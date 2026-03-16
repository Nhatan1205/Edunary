using Edunary.Application.Common.Models;

namespace Edunary.Application.Users.Queries.GetPublicUserInfoQuery;
public class PublicProfileDto
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public string PhoneNumber { get; set; }
    public string Avatar { get; set; }

    public string Headline { get; set; }
    public string Description { get; set; }
    public UserLinksDto Links { get; set; }

    public int TotalLearners { get; set; }
    public int TotalReviews { get; set; }
}
