using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Edunary.Domain.Common;
public class ValidateTokenModel
{
    public string Token { get; set; }
    public bool IsValidToken { get; set; }
    public bool IsExpiredToken { get; set; }
    public string UserId { get; set; }
    public string Email { get; set; }
}
