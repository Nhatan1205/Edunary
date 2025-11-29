namespace Edunary.Infrastructure.Helpers;
public class EmailSettings
{
    public string Host { get; set; } = "";
    public int Port { get; set; } = 587;
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public bool UseSsl { get; set; } = true;
    public string FromName { get; set; } = "";
    public string FromAddress { get; set; } = "";
}
