using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.VideoCaptions.Commands.GenerateAICaption;

public record GenerateAICaptionCommand : IRequest<bool>
{
    public int MediaFileId { get; init; }
    public int? TargetLanguage { get; init; }
}

public class GenerateAICaptionCommandHandler : IRequestHandler<GenerateAICaptionCommand, bool>
{
    private readonly ICaptionGenerationJobService _captionJobService;
    private readonly ICurrentUserService _currentUserService;

    public GenerateAICaptionCommandHandler(
        ICaptionGenerationJobService captionJobService,
        ICurrentUserService currentUserService)
    {
        _captionJobService = captionJobService;
        _currentUserService = currentUserService;
    }

    public Task<bool> Handle(GenerateAICaptionCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        if (string.IsNullOrEmpty(userId))
            return Task.FromResult(false);

        _captionJobService.EnqueueCaptionGeneration(userId, request.MediaFileId, request.TargetLanguage);
        return Task.FromResult(true);
    }
}
