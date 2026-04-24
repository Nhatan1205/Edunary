using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Application.MediaFiles.Queries.GetHlsStreamQuery;

public class GetHlsStreamResult
{
    public string FilePath { get; set; }
    public string ContentType { get; set; }
    public string ErrorType { get; set; }
    public string ErrorMessage { get; set; }
}