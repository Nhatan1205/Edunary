using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Edunary.Domain.Common;
public class AppSettings
{
    public string AccessTokenKey { get; set; }
    public int AccessTokenTime { get; set; }
    public string RefreshTokenKey { get; set; }
    public int RefreshTokenTime { get; set; }
}
