using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.KnowledgeBase.Queries.GetKnowledgeDocuments;

public record GetKnowledgeDocumentsQuery : IRequest<PaginatedList<KnowledgeDocumentDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetKnowledgeDocumentsQueryHandler
    : IRequestHandler<GetKnowledgeDocumentsQuery, PaginatedList<KnowledgeDocumentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetKnowledgeDocumentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<KnowledgeDocumentDto>> Handle(
        GetKnowledgeDocumentsQuery request, CancellationToken ct)
    {
        var query = _context.KnowledgeDocuments
            .AsNoTracking()
            .OrderByDescending(d => d.Created)
            .Select(d => new KnowledgeDocumentDto
            {
                Id = d.Id,
                FileName = d.FileName,
                FileUrl = d.FileUrl,
                ContentType = d.ContentType,
                FileSizeBytes = d.FileSizeBytes,
                Status = d.Status.ToString(),
                ChunkCount = d.ChunkCount,
                ErrorMessage = d.ErrorMessage,
                QdrantCollection = d.QdrantCollection,
                Created = d.Created,
                LastModified = d.LastModified,
            });

        return await PaginatedList<KnowledgeDocumentDto>.CreateAsync(
            query, request.PageNumber, request.PageSize);
    }
}
