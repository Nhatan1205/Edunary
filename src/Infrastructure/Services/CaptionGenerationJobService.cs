using System.Text;
using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Infrastructure.Data;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Services;

public class CaptionGenerationJobService : ICaptionGenerationJobService
{
    private readonly ApplicationDbContext _context;
    private readonly ISender _sender;
    private readonly IAICenterClient _aiCenterClient;
    private readonly IAppHubService _hub;
    private readonly IUploadFileService _uploadFileService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<CaptionGenerationJobService> _logger;

    // Maps Whisper's lowercase language name → Languages enum value
    private static readonly Dictionary<string, Languages> WhisperLanguageMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["afrikaans"] = Languages.Afrikaans,
        ["arabic"] = Languages.Arabic,
        ["armenian"] = Languages.Armenian,
        ["azerbaijani"] = Languages.Azerbaijani,
        ["belarusian"] = Languages.Belarusian,
        ["bosnian"] = Languages.Bosnian,
        ["bulgarian"] = Languages.Bulgarian,
        ["catalan"] = Languages.Catalan,
        ["chinese"] = Languages.Chinese,
        ["croatian"] = Languages.Croatian,
        ["czech"] = Languages.Czech,
        ["danish"] = Languages.Danish,
        ["dutch"] = Languages.Dutch,
        ["english"] = Languages.English,
        ["estonian"] = Languages.Estonian,
        ["finnish"] = Languages.Finnish,
        ["french"] = Languages.French,
        ["galician"] = Languages.Galician,
        ["german"] = Languages.German,
        ["greek"] = Languages.Greek,
        ["hebrew"] = Languages.Hebrew,
        ["hindi"] = Languages.Hindi,
        ["hungarian"] = Languages.Hungarian,
        ["icelandic"] = Languages.Icelandic,
        ["indonesian"] = Languages.Indonesian,
        ["italian"] = Languages.Italian,
        ["japanese"] = Languages.Japanese,
        ["kannada"] = Languages.Kannada,
        ["kazakh"] = Languages.Kazakh,
        ["korean"] = Languages.Korean,
        ["latvian"] = Languages.Latvian,
        ["lithuanian"] = Languages.Lithuanian,
        ["macedonian"] = Languages.Macedonian,
        ["malay"] = Languages.Malay,
        ["marathi"] = Languages.Marathi,
        ["maori"] = Languages.Maori,
        ["nepali"] = Languages.Nepali,
        ["norwegian"] = Languages.Norwegian,
        ["persian"] = Languages.Persian,
        ["polish"] = Languages.Polish,
        ["portuguese"] = Languages.Portuguese,
        ["romanian"] = Languages.Romanian,
        ["russian"] = Languages.Russian,
        ["serbian"] = Languages.Serbian,
        ["slovak"] = Languages.Slovak,
        ["slovenian"] = Languages.Slovenian,
        ["spanish"] = Languages.Spanish,
        ["swahili"] = Languages.Swahili,
        ["swedish"] = Languages.Swedish,
        ["tagalog"] = Languages.Tagalog,
        ["tamil"] = Languages.Tamil,
        ["thai"] = Languages.Thai,
        ["turkish"] = Languages.Turkish,
        ["ukrainian"] = Languages.Ukrainian,
        ["urdu"] = Languages.Urdu,
        ["vietnamese"] = Languages.Vietnamese,
        ["welsh"] = Languages.Welsh,
    };

    public CaptionGenerationJobService(
        ApplicationDbContext context,
        ISender sender,
        IAICenterClient aiCenterClient,
        IAppHubService hub,
        IUploadFileService uploadFileService,
        IHttpClientFactory httpClientFactory,
        ILogger<CaptionGenerationJobService> logger)
    {
        _context = context;
        _sender = sender;
        _aiCenterClient = aiCenterClient;
        _hub = hub;
        _uploadFileService = uploadFileService;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public void EnqueueCaptionGeneration(string userId, int mediaFileId, int? targetLanguage)
    {
        BackgroundJob.Enqueue<ICaptionGenerationJobService>(svc =>
            svc.ProcessCaptionGenerationAsync(userId, mediaFileId, targetLanguage));
    }

    public async Task ProcessCaptionGenerationAsync(string userId, int mediaFileId, int? targetLanguage)
    {
        try
        {
            await SendProgress(userId, 5, "Starting caption generation...", mediaFileId);

            // 1. Load media file
            var mediaFile = await _context.Set<MediaFile>()
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == mediaFileId);

            if (mediaFile == null)
            {
                await SendProgress(userId, -1, "Video not found.", mediaFileId);
                return;
            }

            if (string.IsNullOrEmpty(mediaFile.FileUrl))
            {
                await SendProgress(userId, -1, "Video file URL is not available.", mediaFileId);
                return;
            }

            // 2. Get AI config
            var aiConfig = await _sender.Send(new GetAIConfigQuery());

            // 3. Check for existing source transcript
            var sourceTranscript = await _context.VideoCaptions
                .Where(c => c.MediaFileId == mediaFileId && c.IsSourceTranscript && c.Status == CaptionStatus.COMPLETED)
                .FirstOrDefaultAsync();

            string sourceVttContent = string.Empty;
            string sourceLanguageName = string.Empty;
            Languages sourceLanguage = Languages.English;

            // ── Phase 1: Whisper STT (only if no source transcript exists) ──────
            if (sourceTranscript == null)
            {
                await SendProgress(userId, 10, "Transcribing audio with Whisper AI...", mediaFileId);

                // Create placeholder source transcript record
                var placeholderSource = new VideoCaption
                {
                    MediaFileId = mediaFileId,
                    Language = Languages.English, // Will be updated after detection
                    FileName = $"source_transcript_{mediaFileId}.vtt",
                    FileUrl = string.Empty,
                    FileSize = 0,
                    Status = CaptionStatus.IN_PROGRESS,
                    IsAIGenerated = true,
                    IsSourceTranscript = true,
                };
                _context.VideoCaptions.Add(placeholderSource);
                await _context.SaveChangesAsync(default);

                var transcribePayload = new
                {
                    video_file_url = mediaFile.FileUrl,
                    stt_config = new
                    {
                        api_key = aiConfig.STTApiKey,
                        model_name = aiConfig.STTModelName
                    }
                };

                var transcribeUrl = $"{aiConfig.AICenterBaseUrl}api/transcription/generate";
                var (transcribeSuccess, transcribeBody) = await _aiCenterClient.PostAsync(
                    transcribeUrl, aiConfig.AICenterApiKey, JsonSerializer.Serialize(transcribePayload));

                if (!transcribeSuccess)
                {
                    placeholderSource.Status = CaptionStatus.FAILED;
                    await _context.SaveChangesAsync(default);
                    string errMsg = ExtractErrorMessage(transcribeBody, "Transcription failed.");
                    await SendProgress(userId, -1, errMsg, mediaFileId);
                    return;
                }

                await SendProgress(userId, 45, "Uploading transcript...", mediaFileId);

                // Parse Whisper response
                var transcribeResponse = JsonSerializer.Deserialize<JsonElement>(transcribeBody);
                var transcribeData = transcribeResponse.GetProperty("data");
                sourceVttContent = transcribeData.GetProperty("vtt_content").GetString() ?? string.Empty;
                sourceLanguageName = transcribeData.GetProperty("detected_language").GetString() ?? "english";
                sourceLanguage = MapWhisperLanguage(sourceLanguageName);

                // Upload source VTT to S3
                string sourceFileName = $"{mediaFileId}_source.vtt";
                string sourceFolderPath = $"courses/{userId}/captions";
                string sourceFileUrl = await UploadVttToS3(sourceVttContent, sourceFileName, sourceFolderPath);

                // Update source transcript record
                placeholderSource.Language = sourceLanguage;
                placeholderSource.FileName = sourceFileName;
                placeholderSource.FileUrl = sourceFileUrl;
                placeholderSource.FileSize = Encoding.UTF8.GetByteCount(sourceVttContent);
                placeholderSource.Status = CaptionStatus.COMPLETED;
                await _context.SaveChangesAsync(default);

                sourceTranscript = placeholderSource;
                _logger.LogInformation(
                    "Source transcript created for MediaFile {Id}: language={Lang}",
                    mediaFileId, sourceLanguageName);
            }
            else
            {
                // Load source VTT content from S3 for translation
                sourceLanguage = sourceTranscript.Language;
                sourceLanguageName = MapLanguageToWhisperName(sourceLanguage);

                if (targetLanguage.HasValue)
                {
                    sourceVttContent = await DownloadVttAsync(sourceTranscript.FileUrl);
                    if (string.IsNullOrWhiteSpace(sourceVttContent))
                    {
                        await SendProgress(userId, -1, "Failed to load source transcript.", mediaFileId);
                        return;
                    }
                }
            }

            // No target language requested → transcription only, done.
            if (!targetLanguage.HasValue)
            {
                await SendProgress(userId, 100, "Source transcript created successfully!", mediaFileId);
                return;
            }

            var targetLang = (Languages)targetLanguage.Value;

            // ── Phase 2: Copy or Translate ───────────────────────────────────────
            await SendProgress(userId, 55, $"Generating {targetLang} caption...", mediaFileId);

            // Create placeholder for target caption
            int targetLangInt = targetLanguage.Value;
            string targetFileName = $"{mediaFileId}_{targetLangInt}.vtt";
            string targetFolder = $"courses/{userId}/captions";

            var existingTarget = await _context.VideoCaptions
                .Where(c => c.MediaFileId == mediaFileId && c.Language == targetLang && !c.IsSourceTranscript)
                .FirstOrDefaultAsync();

            VideoCaption targetCaption;
            if (existingTarget == null)
            {
                targetCaption = new VideoCaption
                {
                    MediaFileId = mediaFileId,
                    Language = targetLang,
                    FileName = targetFileName,
                    FileUrl = string.Empty,
                    FileSize = 0,
                    Status = CaptionStatus.IN_PROGRESS,
                    IsAIGenerated = true,
                    IsSourceTranscript = false,
                };
                _context.VideoCaptions.Add(targetCaption);
            }
            else
            {
                targetCaption = existingTarget;
                targetCaption.Status = CaptionStatus.IN_PROGRESS;
            }
            await _context.SaveChangesAsync(default);

            string targetVttContent;

            if (targetLang == sourceLanguage)
            {
                // Same language → copy directly, no AI call
                targetVttContent = sourceVttContent;
                _logger.LogInformation("Caption for MediaFile {Id}: same language as source, copying VTT", mediaFileId);
            }
            else
            {
                // Different language → LLM translate
                await SendProgress(userId, 60, $"Translating to {targetLang}...", mediaFileId);

                var translatePayload = new
                {
                    source_vtt_content = sourceVttContent,
                    source_language = sourceLanguageName,
                    target_language = MapLanguageToWhisperName(targetLang),
                    llm_config = new
                    {
                        model_name = aiConfig.LLMModelName,
                        api_key = aiConfig.LLMApiKey,
                        api_base = aiConfig.LLMBaseUrl,
                        temperature = aiConfig.LLMTemperature,
                        max_tokens = aiConfig.LLMMaxTokens
                    }
                };

                var translateUrl = $"{aiConfig.AICenterBaseUrl}api/transcription/translate";
                var (translateSuccess, translateBody) = await _aiCenterClient.PostAsync(
                    translateUrl, aiConfig.AICenterApiKey, JsonSerializer.Serialize(translatePayload));

                if (!translateSuccess)
                {
                    targetCaption.Status = CaptionStatus.FAILED;
                    await _context.SaveChangesAsync(default);
                    string errMsg = ExtractErrorMessage(translateBody, "Translation failed.");
                    await SendProgress(userId, -1, errMsg, mediaFileId);
                    return;
                }

                var translateResponse = JsonSerializer.Deserialize<JsonElement>(translateBody);
                targetVttContent = translateResponse
                    .GetProperty("data")
                    .GetProperty("vtt_content")
                    .GetString() ?? string.Empty;
            }

            await SendProgress(userId, 85, "Uploading caption file...", mediaFileId);

            // Upload target VTT to S3
            string targetFileUrl = await UploadVttToS3(targetVttContent, targetFileName, targetFolder);

            // Update target caption record
            targetCaption.FileUrl = targetFileUrl;
            targetCaption.FileSize = Encoding.UTF8.GetByteCount(targetVttContent);
            targetCaption.Status = CaptionStatus.COMPLETED;
            await _context.SaveChangesAsync(default);

            _logger.LogInformation(
                "Caption generation complete for MediaFile {Id}: language={Lang}",
                mediaFileId, targetLang);

            await _hub.SendAsync($"Caption.Generate:{userId}", new
            {
                percent = 100,
                message = $"{targetLang} caption generated successfully!",
                mediaFileId,
                captionId = targetCaption.Id,
                language = (int)targetLang,
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CaptionGenerationJobService failed for userId={UserId}, mediaFileId={Id}", userId, mediaFileId);
            await SendProgress(userId, -1, $"An error occurred: {ex.Message}", mediaFileId);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<string> UploadVttToS3(string vttContent, string fileName, string folderPath)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(vttContent);
        using var stream = new MemoryStream(bytes);
        string fileUrl = await _uploadFileService.UploadFileToSpacesAsync(stream, fileName, "text/vtt", folderPath);
        if (string.IsNullOrEmpty(fileUrl))
            throw new InvalidOperationException($"Failed to upload VTT file '{fileName}' to storage.");
        return fileUrl;
    }

    private async Task<string> DownloadVttAsync(string fileUrl)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            return await client.GetStringAsync(fileUrl);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed to download VTT from {Url}: {Error}", fileUrl, ex.Message);
            return string.Empty;
        }
    }

    private Task SendProgress(string userId, int percent, string message, int mediaFileId)
        => _hub.SendAsync($"Caption.Generate:{userId}", new { percent, message, mediaFileId });

    private static Languages MapWhisperLanguage(string whisperName)
        => WhisperLanguageMap.TryGetValue(whisperName, out Languages lang) ? lang : Languages.English;

    private static string MapLanguageToWhisperName(Languages language)
        => WhisperLanguageMap
            .FirstOrDefault(kvp => kvp.Value == language)
            .Key ?? language.ToString().ToLowerInvariant();

    private static string ExtractErrorMessage(string body, string fallback)
    {
        try
        {
            var errJson = JsonSerializer.Deserialize<JsonElement>(body);
            if (errJson.TryGetProperty("message", out var msgEl) && msgEl.GetString() is { } msg && !string.IsNullOrWhiteSpace(msg))
                return msg;
            if (errJson.TryGetProperty("detail", out var detailEl) && detailEl.GetString() is { } detail && !string.IsNullOrWhiteSpace(detail))
                return detail;
        }
        catch { /* ignore */ }
        return fallback;
    }
}
