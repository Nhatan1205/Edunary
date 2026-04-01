using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.MediaFiles.EventHandlers;

public class UploadSessionCompletedEventHandler : INotificationHandler<UploadSessionCompletedEvent>
{
    private readonly ILogger<UploadSessionCompletedEventHandler> _logger;
    private readonly IProcessMediaFileJobService _jobService;

    public UploadSessionCompletedEventHandler(
        ILogger<UploadSessionCompletedEventHandler> logger,
        IProcessMediaFileJobService jobService)
    {
        _logger = logger;
        _jobService = jobService;
    }

    public Task Handle(UploadSessionCompletedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Domain Event: {DomainEvent} - Queuing video to process for MediaFile {MediaFileId}",
            notification.GetType().Name, notification.MediaFile.Id);

        _jobService.EnqueueVideoProcessing(notification.MediaFile.Id);

        return Task.CompletedTask;
    }
}
