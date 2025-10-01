using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Edunary.Domain.Helpers;
public static class Utils
{
	public static string GetEnumMemberValue<T>(T enumValue)
	{
        MemberInfo memberInfo = typeof(T).GetField(enumValue.ToString());
        EnumMemberAttribute attribute = memberInfo.GetCustomAttribute<EnumMemberAttribute>();
        return attribute?.Value;
    }
}
