using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Edunary.Domain.Common;
public class DigitalOceanSettings
{
    public string AccessKey { get; set; }
    public string SecretKey { get; set; }
    public string SpaceName { get; set; }
    public string SpacesRegion { get; set; }
    public string Endpoint { get; set; }
    public string CDNEndpoint { get; set; }
}
