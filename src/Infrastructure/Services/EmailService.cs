using Edunary.Application.Common.Interfaces;
using Edunary.Application.SystemSettings.Queries.GetSystemSettingValuesQuery;
using Edunary.Domain.Constants;
using Edunary.Infrastructure.Helpers;
using Hangfire;
using MailKit.Net.Smtp;
using MailKit.Security;
using MediatR;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Edunary.Infrastructure.Services;
public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly IMediator _mediator;

    public EmailService(IOptions<EmailSettings> options, IMediator mediator)
    {
        _settings = options.Value;
        _mediator = mediator;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string content)
    {
        var settings = await GetEmailSettingsAsync();
        var message = CreateMimeMessage(toEmail, subject, content, settings);
        await SendMimeMessageAsync(message, settings);
    }

    public Task SendBulkEmailsAsync(IEnumerable<string> toEmails, string subject, string content)
    {
        foreach (var email in toEmails)
        {
            BackgroundJob.Enqueue<EmailService>(service =>
                service.SendEmailAsync(email, subject, content)
            );
        }

        return Task.CompletedTask;
    }

    public void EnqueueEmailAsync(string toEmail, string subject, string content)
    {
        BackgroundJob.Enqueue<EmailService>(service =>
            service.SendEmailAsync(toEmail, subject, content)
        );
    }

    private async Task<EmailSettings> GetEmailSettingsAsync()
    {
        var dbValues = await _mediator.Send(new GetSystemSettingValuesQuery
        {
            Keys = new()
            {
                SettingKey.Email_Host,
                SettingKey.Email_Port,
                SettingKey.Email_Username,
                SettingKey.Email_Password,
                SettingKey.Email_UseSsl,
                SettingKey.Email_FromName,
                SettingKey.Email_FromAddress
            }
        });

        return new EmailSettings
        {
            Host = GetOrFallback(dbValues, SettingKey.Email_Host, _settings.Host),
            Port = int.TryParse(GetOrFallback(dbValues, SettingKey.Email_Port, _settings.Port.ToString()), out var p) ? p : _settings.Port,
            Username = GetOrFallback(dbValues, SettingKey.Email_Username, _settings.Username),
            Password = GetOrFallback(dbValues, SettingKey.Email_Password, _settings.Password),
            UseSsl = bool.TryParse(GetOrFallback(dbValues, SettingKey.Email_UseSsl, _settings.UseSsl.ToString()), out var ssl) ? ssl : _settings.UseSsl,
            FromName = GetOrFallback(dbValues, SettingKey.Email_FromName, _settings.FromName),
            FromAddress = GetOrFallback(dbValues, SettingKey.Email_FromAddress, _settings.FromAddress),
        };
    }

    private MimeMessage CreateMimeMessage(string toEmail, string subject, string htmlContent, EmailSettings settings)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(settings.FromName, settings.FromAddress));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = htmlContent
        };

        message.Body = bodyBuilder.ToMessageBody();
        return message;
    }

    private async Task SendMimeMessageAsync(MimeMessage message, EmailSettings settings)
    {
        using var smtp = new SmtpClient();
        try
        {
            await smtp.ConnectAsync(settings.Host, settings.Port, settings.UseSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto);
            if (!string.IsNullOrWhiteSpace(settings.Username))
            {
                await smtp.AuthenticateAsync(settings.Username, settings.Password);
            }
            await smtp.SendAsync(message);
        }
        finally
        {
            await smtp.DisconnectAsync(true);
        }
    }

    private static string GetOrFallback(Dictionary<string, string> dbValues, string key, string fallback)
    {
        var val = dbValues.GetValueOrDefault(key, string.Empty);
        return !string.IsNullOrEmpty(val) ? val : fallback;
    }
}

