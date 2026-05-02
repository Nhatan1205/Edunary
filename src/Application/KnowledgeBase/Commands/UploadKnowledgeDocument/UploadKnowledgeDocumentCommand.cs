using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.Extensions.Logging;


namespace Edunary.Application.KnowledgeBase.Commands.UploadKnowledgeDocument;

/// <summary>
/// Command for uploading a knowledge document for RAG ingestion.
/// The Web layer is responsible for reading the IFormFile and passing primitives here.
/// If a document with the same file name already exists, it is automatically deleted
/// (Qdrant vectors + DO Spaces file + DB record) before the new version is ingested.
/// </summary>
public record UploadKnowledgeDocumentCommand : IRequest<ReturnResult<KnowledgeDocumentDto>>
{
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long FileSizeBytes { get; init; }
    public Stream FileStream { get; init; } = Stream.Null;
}

public class UploadKnowledgeDocumentCommandHandler : IRequestHandler<UploadKnowledgeDocumentCommand, ReturnResult<KnowledgeDocumentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUploadFileService _uploadFileService;
    private readonly IKnowledgeBaseJobService _jobService;
    private readonly ILogger<UploadKnowledgeDocumentCommandHandler> _logger;

    public UploadKnowledgeDocumentCommandHandler(
        IApplicationDbContext context,
        IUploadFileService uploadFileService,
        IKnowledgeBaseJobService jobService,
        ILogger<UploadKnowledgeDocumentCommandHandler> logger)
    {
        _context = context;
        _uploadFileService = uploadFileService;
        _jobService = jobService;
        _logger = logger;
    }


    public async Task<ReturnResult<KnowledgeDocumentDto>> Handle(UploadKnowledgeDocumentCommand request, CancellationToken ct)
    {
        try
        {
            // ── 0. Re-ingestion guard: delete existing doc with same file name ──────────
            var existing = await _context.KnowledgeDocuments
                .Where(d => d.FileName == request.FileName)
                .ToListAsync(ct);

            foreach (var old in existing)
            {
                _logger.LogInformation(
                    "Re-upload detected for '{FileName}'. Queuing deletion of existing document ID {Id}.",
                    request.FileName, old.Id);

                // Mark as Deleting immediately, then let the background job handle cleanup
                old.Status = KnowledgeDocumentStatus.Deleting;
                _jobService.EnqueueDocumentDeletion(old.Id);
            }

            if (existing.Any())
                await _context.SaveChangesAsync(ct);

            // ── 1. Upload new file to DO Spaces ──────────────────────────────────────────
            string folderGuid = Guid.NewGuid().ToString();
            string fileKey = $"knowledge-base/{folderGuid}/{request.FileName}";

            string fileUrl = await _uploadFileService.UploadFileToSpacesAsync(
                request.FileStream,
                request.FileName,
                request.ContentType,
                $"knowledge-base/{folderGuid}");

            // ── 2. Save new entity with Status = Pending ─────────────────────────────────
            var document = new KnowledgeDocument
            {
                FileName = request.FileName,
                FileKey = fileKey,
                FileUrl = fileUrl,
                ContentType = request.ContentType,
                FileSizeBytes = request.FileSizeBytes,
                Status = KnowledgeDocumentStatus.Pending,
                QdrantCollection = "edunary_docs",
            };

            _context.KnowledgeDocuments.Add(document);
            await _context.SaveChangesAsync(ct);

            // ── 3. Enqueue Hangfire background ingestion job ──────────────────────────────
            _jobService.EnqueueDocumentIngestion(document.Id);

            _logger.LogInformation(
                "Knowledge document {Id} ({FileName}) uploaded and queued for ingestion.",
                document.Id, document.FileName);

            return new ReturnResult<KnowledgeDocumentDto>
            {
                Result = new KnowledgeDocumentDto
                {
                    Id = document.Id,
                    FileName = document.FileName,
                    FileUrl = document.FileUrl,
                    ContentType = document.ContentType,
                    FileSizeBytes = document.FileSizeBytes,
                    Status = document.Status.ToString(),
                    QdrantCollection = document.QdrantCollection,
                },
                Message = existing.Any()
                    ? $"Document re-uploaded successfully. Previous version deleted. Embedding will begin shortly."
                    : "Document uploaded successfully. Embedding will begin shortly."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload knowledge document.");
            return new ReturnResult<KnowledgeDocumentDto>
            {
                Result = null,
                Message = $"Upload failed: {ex.Message}"
            };
        }
    }
}
