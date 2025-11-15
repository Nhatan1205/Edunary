using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Application.CourseContents.Commands.GenerateUploadUrl;

public class GenerateUploadUrlDto
{
    public string UploadUrl { get; set; }
    public string FileName { get; set; }
    public string FileUrl { get; set; }
}
