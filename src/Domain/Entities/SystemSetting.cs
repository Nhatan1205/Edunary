namespace Edunary.Domain.Entities;

public class SystemSetting : BaseAuditableEntity
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; }
}
