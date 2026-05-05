using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.KnowledgeBase.Commands.DeleteKnowledgeDocument;

public record DeleteKnowledgeDocumentCommand(int Id) : IRequest<Result>;

public class DeleteKnowledgeDocumentCommandHandler : IRequestHandler<DeleteKnowledgeDocumentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IKnowledgeBaseJobService _jobService;
    private readonly ILogger<DeleteKnowledgeDocumentCommandHandler> _logger;

    public DeleteKnowledgeDocumentCommandHandler(
        IApplicationDbContext context,
        IKnowledgeBaseJobService jobService,
        ILogger<DeleteKnowledgeDocumentCommandHandler> logger)
    {
        _context = context;
        _jobService = jobService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteKnowledgeDocumentCommand request, CancellationToken ct)
    {
        var document = await _context.KnowledgeDocuments.FindAsync([request.Id], ct);
        if (document == null)
            return Result.Failure($"Document with ID {request.Id} not found.");

        // Mark as Deleting immediately so the UI reflects the pending cleanup
        document.Status = KnowledgeDocumentStatus.Deleting;
        await _context.SaveChangesAsync(ct);

        // Enqueue the actual cleanup: AI Center (Qdrant) → DO Spaces → DB
        _jobService.EnqueueDocumentDeletion(request.Id);

        _logger.LogInformation(
            "Knowledge document {Id} ({FileName}) queued for deletion.",
            request.Id, document.FileName);

        return Result.Success(message: "Document queued for deletion. Cleanup will complete in the background.");
    }
}
