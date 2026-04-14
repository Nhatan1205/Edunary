using Edunary.Domain.Entities;

namespace Edunary.Application.SystemSettings.Queries.GetSystemSettingsQuery;

public class SystemSettingDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public string LastModifiedBy { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<SystemSetting, SystemSettingDto>();
        }
    }
}
