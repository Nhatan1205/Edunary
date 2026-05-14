namespace Edunary.Application.Common.Interfaces;
public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string content, string fromName = null);
    Task SendBulkEmailsAsync(IEnumerable<string> toEmails, string subject, string content, string fromName = null);
}

