namespace Edunary.Domain.Constants;

/// <summary>
/// String constants cho System Setting keys.
/// Dùng static class thay vì enum để:
/// - DB lưu string trực tiếp, dễ query/debug
/// - Frontend dùng string luôn, không cần mapping số
/// - Thêm key mới không ảnh hưởng giá trị cũ
/// </summary>
public static class SettingKey
{
    // === Stripe ===
    public const string Stripe_PublishableKey = "Stripe_PublishableKey";
    public const string Stripe_SecretKey = "Stripe_SecretKey";

    // === Cloudinary ===
    public const string Cloudinary_CloudName = "Cloudinary_CloudName";
    public const string Cloudinary_ApiKey = "Cloudinary_ApiKey";
    public const string Cloudinary_ApiSecret = "Cloudinary_ApiSecret";

    // === DigitalOcean ===
    public const string DigitalOcean_AccessKey = "DigitalOcean_AccessKey";
    public const string DigitalOcean_SecretKey = "DigitalOcean_SecretKey";
    public const string DigitalOcean_SpaceName = "DigitalOcean_SpaceName";
    public const string DigitalOcean_SpacesRegion = "DigitalOcean_SpacesRegion";
    public const string DigitalOcean_Endpoint = "DigitalOcean_Endpoint";
    public const string DigitalOcean_CDNEndpoint = "DigitalOcean_CDNEndpoint";

    // === Email ===
    public const string Email_Host = "Email_Host";
    public const string Email_Port = "Email_Port";
    public const string Email_Username = "Email_Username";
    public const string Email_Password = "Email_Password";
    public const string Email_UseSsl = "Email_UseSsl";
    public const string Email_FromName = "Email_FromName";
    public const string Email_FromAddress = "Email_FromAddress";

    // === AI Center ===
    public const string AICenter_BaseUrl = "AICenter_BaseUrl";
    public const string AICenter_ApiKey = "AICenter_ApiKey";

    // === LLM Config ===
    public const string LLM_ModelName = "LLM_ModelName";
    public const string LLM_ApiKey = "LLM_ApiKey";
    public const string LLM_BaseUrl = "LLM_BaseUrl";
    public const string LLM_Temperature = "LLM_Temperature";
    public const string LLM_MaxTokens = "LLM_MaxTokens";

    // use for whitelist key
    private static readonly HashSet<string> _publicKeys = new()
    {
        AICenter_BaseUrl,
    };

    public static bool IsPublicKey(string key)
    {
        return _publicKeys.Contains(key);
    }

    public static IReadOnlyList<string> GetPublicKeys()
    {
        return _publicKeys.ToList();
    }

    public static IReadOnlyList<string> GetAllKeys()
    {
        return typeof(SettingKey)
            .GetFields(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static)
            .Where(f => f.IsLiteral && !f.IsInitOnly && f.FieldType == typeof(string))
            .Select(f => (string)f.GetRawConstantValue()!)
            .ToList();
    }
}
