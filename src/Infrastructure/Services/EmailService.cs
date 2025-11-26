using System.Threading;
using Edunary.Application.Common.Interfaces;
using Edunary.Infrastructure.Helpers;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Edunary.Infrastructure.Services;
public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    public EmailService(IOptions<EmailSettings> options)
    {
        _settings = options.Value;
    }
    public async Task SendEmailAsync(string toEmail, string subject, string content)
    {
        var message = CreateMimeMessage(toEmail, subject, content);
        await SendMimeMessageAsync(message);
    }
    public async Task SendBulkEmailsAsync(IEnumerable<string> toEmails, string subject, string content)
    {
        var tasks = toEmails.Select(email =>
        {
            var msg = CreateMimeMessage(email, subject, content);
            return SendMimeMessageAsync(msg);
        });
        await Task.WhenAll(tasks);
    }

    private MimeMessage CreateMimeMessage(string toEmail, string subject, string htmlContent)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = htmlContent
        };

        message.Body = bodyBuilder.ToMessageBody();
        return message;
    }

    private async Task SendMimeMessageAsync(MimeMessage message)
    {
        using var smtp = new SmtpClient();
        try
        {
            // kết nối
            await smtp.ConnectAsync(_settings.Host, _settings.Port, _settings.UseSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto);
            if (!string.IsNullOrWhiteSpace(_settings.Username))
            {
                await smtp.AuthenticateAsync(_settings.Username, _settings.Password);
            }
            await smtp.SendAsync(message);
        }
        finally
        {
            await smtp.DisconnectAsync(true);
        }
    }

}
