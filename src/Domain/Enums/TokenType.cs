using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Edunary.Domain.Enums;
public enum TokenType
{
    [EnumMember(Value = "AccessToken")]
    AccessToken,
    [EnumMember(Value = "RefreshToken")]
    RefreshToken
}
