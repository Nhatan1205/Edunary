#nullable enable
namespace Edunary.Application.Common.Interfaces;
public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string content, string? fromName = null);
    Task SendBulkEmailsAsync(IEnumerable<string> toEmails, string subject, string content, string? fromName = null);

    // Health probe
    Task<(bool IsReachable, string? Error)> CheckConnectionAsync(CancellationToken ct = default);
}

