using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Domain.Entities;

public class VideoCaption : BaseAuditableEntity
{
    public int MediaFileId { get; set; }
    public Languages Language { get; set; }
    public string FileName { get; set; }
    public string FileUrl { get; set; }
    public long FileSize { get; set; }
    public CaptionStatus Status { get; set; }

    /// <summary>
    /// True when this caption was created by AI (Whisper STT or LLM translation).
    /// False when manually uploaded by the instructor.
    /// </summary>
    public bool IsAIGenerated { get; set; }

    /// <summary>
    /// True when this record is the raw Whisper transcript used as translation source.
    /// Source transcripts are hidden from students and instructors — they serve only
    /// as internal translation material. Each MediaFile has at most one source transcript.
    /// </summary>
    public bool IsSourceTranscript { get; set; }

    public MediaFile MediaFile { get; set; } = null!;
}
