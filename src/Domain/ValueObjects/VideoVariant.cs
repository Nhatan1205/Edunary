using System;
using System.Collections.Generic;
using Edunary.Domain.Common;

namespace Edunary.Domain.ValueObjects;

public class VideoVariant : ValueObject
{
    public string Name { get; private set; }
    public string Resolution { get; private set; }
    public string VideoBitrate { get; private set; }
    public string AudioBitrate { get; private set; }

    private VideoVariant() { } // EF Core

    private VideoVariant(string name, string resolution, string videoBitrate, string audioBitrate)
    {
        Name = name;
        Resolution = resolution;
        VideoBitrate = videoBitrate;
        AudioBitrate = audioBitrate;
    }

    public static VideoVariant From(string name, string resolution, string videoBitrate, string audioBitrate)
    {
        return new VideoVariant(name, resolution, videoBitrate, audioBitrate);
    }

    public int GetBandwidthEstimate()
    {
        // Rough estimate for bandwidth (similar to Java version)
        int videoKbps = int.Parse(VideoBitrate.Replace("k", ""));
        int audioKbps = int.Parse(AudioBitrate.Replace("k", ""));
        return (videoKbps + audioKbps) * 1024;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Name;
        yield return Resolution;
        yield return VideoBitrate;
        yield return AudioBitrate;
    }
}
