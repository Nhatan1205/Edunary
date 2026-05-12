using System.Text;
using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Edunary.Domain.Enums;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;


namespace Edunary.Infrastructure.Services;

public class KnowledgeBaseJobService : IKnowledgeBaseJobService
{
    private readonly IApplicationDbContext _context;
    private readonly IAICenterClient _aiCenterClient;
    private readonly IUploadFileService _uploadFileService;
    private readonly ISender _sender;
    private readonly INotifyService _notifyService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<KnowledgeBaseJobService> _logger;


    public KnowledgeBaseJobService(
        IApplicationDbContext context,
        IAICenterClient aiCenterClient,
        IUploadFileService uploadFileService,
        ISender sender,
        INotifyService notifyService,
        IHttpClientFactory httpClientFactory,
        ILogger<KnowledgeBaseJobService> logger)
    {
        _context = context;
        _aiCenterClient = aiCenterClient;
        _uploadFileService = uploadFileService;
        _sender = sender;
        _notifyService = notifyService;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }


    public void EnqueueDocumentIngestion(int documentId)
    {
        BackgroundJob.Enqueue<IKnowledgeBaseJobService>(
            svc => svc.ProcessDocumentIngestionAsync(documentId));
    }

    public void EnqueueDocumentDeletion(int documentId)
    {
        BackgroundJob.Enqueue<IKnowledgeBaseJobService>(
            svc => svc.ProcessDocumentDeletionAsync(documentId));
    }

    public async Task ProcessDocumentIngestionAsync(int documentId)
    {
        _logger.LogInformation("Starting RAG ingestion job for KnowledgeDocument ID: {Id}", documentId);

        var document = await _context.KnowledgeDocuments.FirstOrDefaultAsync(d => d.Id == documentId);
        if (document == null)
        {
            _logger.LogError("KnowledgeDocument with ID {Id} not found.", documentId);
            return;
        }

        // 1. Mark as Processing
        document.Status = KnowledgeDocumentStatus.Processing;
        await _context.SaveChangesAsync(default);

        try
        {
            // 2. Get AI config (embedding + qdrant settings from SystemSettings)
            var aiConfig = await _sender.Send(new GetAIConfigQuery());

            // 3. Download file bytes from DO Spaces using the public URL
            byte[] fileBytes = await DownloadFileBytesAsync(document.FileUrl);

            // 4. Build payload for AI Center
            var payload = new
            {
                file_key = document.FileKey,
                file_name = document.FileName,
                file_bytes = Convert.ToBase64String(fileBytes),
                content_type = document.ContentType,
                collection = document.QdrantCollection,
                embedding_config = new
                {
                    provider = aiConfig.EmbeddingProvider,
                    model_name = aiConfig.EmbeddingModelName,
                    api_key = aiConfig.EmbeddingApiKey,
                    base_url = aiConfig.EmbeddingBaseUrl,
                },
                qdrant_config = new
                {
                    url = aiConfig.QdrantUrl,
                    api_key = aiConfig.QdrantApiKey,
                    collection = aiConfig.QdrantCollection,
                }
            };

            // 5. Call AI Center ingest endpoint
            var url = $"{aiConfig.AICenterBaseUrl}api/rag/ingest";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload));

            if (!isSuccess)
            {
                _logger.LogError("AI Center ingest failed for document {Id}: {Body}", documentId, body);
                document.Status = KnowledgeDocumentStatus.Failed;
                document.ErrorMessage = $"AI Center returned failure: {body}";
                await _context.SaveChangesAsync(default);
                //await NotifyAdminAsync("KnowledgeBaseUpdate", documentId, document.FileName, "Failed");
                return;
            }

            // 6. Parse chunk_count from response
            int chunkCount = 0;
            try
            {
                var response = JsonSerializer.Deserialize<JsonElement>(body);
                if (response.TryGetProperty("chunk_count", out var chunkProp))
                {
                    chunkCount = chunkProp.GetInt32();
                }
            }
            catch
            {
                _logger.LogWarning("Could not parse chunk_count from AI Center response for document {Id}.", documentId);
            }

            // 7. Mark as Completed
            document.Status = KnowledgeDocumentStatus.Completed;
            document.ChunkCount = chunkCount;
            document.ErrorMessage = null;
            await _context.SaveChangesAsync(default);

            _logger.LogInformation(
                "RAG ingestion completed for document {Id} ({FileName}). Chunks: {ChunkCount}",
                documentId, document.FileName, chunkCount);

            //await NotifyAdminAsync("KnowledgeBaseUpdate", documentId, document.FileName, "Completed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RAG ingestion failed for document {Id}.", documentId);
            document.Status = KnowledgeDocumentStatus.Failed;
            document.ErrorMessage = ex.Message;
            await _context.SaveChangesAsync(default);
            //await NotifyAdminAsync("KnowledgeBaseUpdate", documentId, document.FileName, "Failed");
        }
    }

    private async Task<byte[]> DownloadFileBytesAsync(string fileUrl)
    {
        var httpClient = _httpClientFactory.CreateClient();
        var response = await httpClient.GetAsync(fileUrl);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsByteArrayAsync();
    }

    public async Task ProcessDocumentDeletionAsync(int documentId)
    {
        _logger.LogInformation("Starting deletion job for KnowledgeDocument ID: {Id}", documentId);

        var document = await _context.KnowledgeDocuments.FirstOrDefaultAsync(d => d.Id == documentId);
        if (document == null)
        {
            _logger.LogWarning("KnowledgeDocument {Id} not found during deletion job — already removed.", documentId);
            return;
        }

        try
        {
            var aiConfig = await _sender.Send(new GetAIConfigQuery());

            // 1. Delete Qdrant vectors via AI Center
            if (!string.IsNullOrEmpty(aiConfig.AICenterBaseUrl))
            {
                var deletePayload = new
                {
                    file_key = document.FileKey,
                    collection = document.QdrantCollection,
                    qdrant_config = new
                    {
                        url = aiConfig.QdrantUrl,
                        api_key = aiConfig.QdrantApiKey,
                        collection = aiConfig.QdrantCollection,
                    }
                };

                var url = $"{aiConfig.AICenterBaseUrl}api/rag/delete";
                var (isSuccess, body) = await _aiCenterClient.PostAsync(
                    url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(deletePayload));

                if (!isSuccess)
                    _logger.LogWarning("AI Center delete returned failure for document {Id}: {Body}", documentId, body);
                else
                    _logger.LogInformation("AI Center deleted Qdrant chunks for document {Id}.", documentId);
            }

            // 2. Delete file from DO Spaces
            await _uploadFileService.DeleteObjectByKeyAsync(document.FileKey);

            // 3. Remove entity from DB
            _context.KnowledgeDocuments.Remove(document);
            await _context.SaveChangesAsync(default);

            _logger.LogInformation("Knowledge document {Id} ({FileName}) deleted successfully.", documentId, document.FileName);
            //await NotifyAdminAsync("KnowledgeBaseUpdate", documentId, document.FileName, "Deleted");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Deletion job failed for document {Id}.", documentId);
            // Don't flip status back — the document stays Deleting; admin can retry
        }
    }

    //private async Task NotifyAdminAsync(string eventName, int documentId, string fileName, string state)
    //{
    //    try
    //    {
    //        await _notifyService.SendMessage(
    //            sender: "system",
    //            message: System.Text.Json.JsonSerializer.Serialize(new
    //            {
    //                documentId,
    //                fileName,
    //                state,
    //                timestamp = DateTime.UtcNow
    //            }),
    //            method: eventName);
    //    }
    //    catch (Exception ex)
    //    {
    //        _logger.LogWarning(ex, "Could not send SignalR notification for KnowledgeBaseUpdate.");
    //    }
    //}
}
