using System.Security.Cryptography;
using System.Text;

namespace Edunary.Infrastructure.Helpers;
public static class HmacHelper
{
    public static string ComputeSha256(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    public static string ComputeHmac(string secret, string message)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secret);
        var msgBytes = Encoding.UTF8.GetBytes(message);
        var hash = HMACSHA256.HashData(keyBytes, msgBytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}   
