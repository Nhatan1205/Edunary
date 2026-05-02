using Edunary.Application.Common.Models;

namespace Edunary.Application.UserEmbeddings.Queries.GetUserEmbeddingSyncStatus;

public class UserEmbeddingSyncStatusDto
{
    public int TotalUsers { get; init; }
    public int TotalEmbedded { get; init; }
    public int TotalMissing { get; init; }
    public PaginatedList<UserEmbeddingItemDto> Data { get; init; }
}

public class UserEmbeddingItemDto
{
    public string UserId { get; init; }
    public string FullName { get; init; }
    public string Email { get; init; }
    public bool IsEmbedded { get; init; }
}
