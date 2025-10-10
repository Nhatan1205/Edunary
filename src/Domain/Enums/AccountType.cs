using System.Runtime.Serialization;

namespace Edunary.Domain.Enums;
public enum AccountType
{
    [EnumMember(Value = "System")]
    System,
    [EnumMember(Value= "Social")]
    Social
}