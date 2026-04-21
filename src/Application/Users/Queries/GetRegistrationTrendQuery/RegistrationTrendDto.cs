namespace Edunary.Application.Users.Queries.GetRegistrationTrendQuery;

public class RegistrationTrendDto
{
    public string Period { get; set; }
    public List<string> Labels { get; set; } = new();
    public List<int> Data { get; set; } = new();
}
