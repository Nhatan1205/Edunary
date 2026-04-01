using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Domain.Common;
using Edunary.Domain.Entities;

namespace Edunary.Domain.Events;

public class UploadSessionCompletedEvent : BaseEvent
{
    public UploadSessionCompletedEvent(MediaFile mediaFile)
    {
        MediaFile = mediaFile;
    }

    public MediaFile MediaFile { get; }
}