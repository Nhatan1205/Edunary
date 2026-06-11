namespace Edunary.Domain.Constants;

public static class SettingKey
{
    // Stripe 
    public const string Stripe_PublishableKey = "Stripe_PublishableKey";
    public const string Stripe_SecretKey = "Stripe_SecretKey";

    // Cloudinary 
    public const string Cloudinary_CloudName = "Cloudinary_CloudName";
    public const string Cloudinary_ApiKey = "Cloudinary_ApiKey";
    public const string Cloudinary_ApiSecret = "Cloudinary_ApiSecret";

    // DigitalOcean 
    public const string DigitalOcean_AccessKey = "DigitalOcean_AccessKey";
    public const string DigitalOcean_SecretKey = "DigitalOcean_SecretKey";
    public const string DigitalOcean_SpaceName = "DigitalOcean_SpaceName";
    public const string DigitalOcean_SpacesRegion = "DigitalOcean_SpacesRegion";
    public const string DigitalOcean_Endpoint = "DigitalOcean_Endpoint";
    public const string DigitalOcean_CDNEndpoint = "DigitalOcean_CDNEndpoint";

    // Email 
    public const string Email_Host = "Email_Host";
    public const string Email_Port = "Email_Port";
    public const string Email_Username = "Email_Username";
    public const string Email_Password = "Email_Password";
    public const string Email_UseSsl = "Email_UseSsl";
    public const string Email_FromName = "Email_FromName";
    public const string Email_FromAddress = "Email_FromAddress";

    // AI Center 
    public const string AICenter_Chatbot = "AICenter_Chatbot";
    public const string AICenter_BaseUrl = "AICenter_BaseUrl";
    public const string AICenter_ApiKey = "AICenter_ApiKey";

    // LLM Config 
    public const string LLM_ModelName = "LLM_ModelName";
    public const string LLM_ApiKey = "LLM_ApiKey";
    public const string LLM_BaseUrl = "LLM_BaseUrl";
    public const string LLM_Temperature = "LLM_Temperature";
    public const string LLM_MaxTokens = "LLM_MaxTokens";

    // Embedding Config
    public const string Embedding_Provider = "Embedding_Provider";
    public const string Embedding_ModelName = "Embedding_ModelName";
    public const string Embedding_ApiKey = "Embedding_ApiKey";
    public const string Embedding_BaseUrl = "Embedding_BaseUrl";

    // Qdrant Config
    public const string Qdrant_Url = "Qdrant_Url";
    public const string Qdrant_ApiKey = "Qdrant_ApiKey";
    public const string Qdrant_Collection = "Qdrant_Collection";

    // Redis Config
    public const string Redis_Host = "Redis_Host";
    public const string Redis_Port = "Redis_Port";
    public const string Redis_Password = "Redis_Password";

    // STT Config (Speech-to-Text — used by AI Quiz Generator)
    public const string STT_ApiKey = "STT_ApiKey";
    public const string STT_ModelName = "STT_ModelName";


    // === Tax ===
    public const string Tax_DefaultVatRate = "Tax_DefaultVatRate";
    public const string Tax_DefaultWithholdingRate = "Tax_DefaultWithholdingRate";
    public const string Tax_RefundHoldDays = "Tax_RefundHoldDays";

    // === Coupon ===
    public const string Coupon_AllowInstructorCoupons = "Coupon_AllowInstructorCoupons";
    public const string Coupon_MaxActivePerCoursePerMonth = "Coupon_MaxActivePerCoursePerMonth";
    public const string Coupon_MaxPercentageDiscount = "Coupon_MaxPercentageDiscount";
    public const string Coupon_PlatformDefaultFunder = "Coupon_PlatformDefaultFunder";

    // === Payout ===
    public const string Payout_MinThresholdUsd = "Payout_MinThresholdUsd";
    public const string Payout_BatchDayOfMonth = "Payout_BatchDayOfMonth";
    public const string Payout_AutoRunBatch = "Payout_AutoRunBatch";

    // use for whitelist key
    private static readonly HashSet<string> _publicKeys = new()
    {
        AICenter_BaseUrl,
        AICenter_Chatbot,
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
