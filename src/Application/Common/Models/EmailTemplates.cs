namespace Edunary.Application.Common.Models;

public static class EmailTemplates
{
    public static string BuildRegistrationTemplate(string fullName, string verifyUrl, string siteUrl = "https://edunary.runasp.net/", string logoUrl = "https://res.cloudinary.com/dyuebf69z/image/upload/v1764309386/logo_white_o2fonq.png")
    {
        return $@"
        <!doctype html>
        <html>
        <head>
            <meta charset=""utf-8"" />
            <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
        </head>
        <body style=""margin:0;padding:0;font-family: 'Segoe UI', Arial, sans-serif;background:#fef5f5;"">
            <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                    <td align=""center"" style=""padding:40px 20px;"">
                        <table role=""presentation"" width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);"">
                            <!-- Header -->
                            <tr>
                                <td style=""background:#00A76F;padding:24px 32px;"">
                                    <div style=""line-height:32px;"">
                                        <img src=""{logoUrl}"" 
                                            alt=""Logo"" 
                                            width=""32"" 
                                            height=""32"" 
                                            style=""display:inline-block; vertical-align:middle; margin-right:8px; border:0;"" />
                                        <span style=""color:#ffffff; font-size:22px; font-weight:600; vertical-align:middle; display:inline-block; letter-spacing:-0.5px;"">
                                            Edunary
                                        </span>
                                    </div>
                                </td>
                            </tr>
                            <!-- Content -->
                            <tr>
                                <td style=""padding:32px;"">
                                    <h2 style=""font-size:18px;font-weight:600;margin:0 0 16px 0;color:#1a202c;"">Verify Your Email</h2>
                                    <div style=""font-size:15px;line-height:1.6;color:#4a5568;"">
                                        <p>Hello {System.Net.WebUtility.HtmlEncode(fullName)},</p>
                                        <p>Thank you for joining Edunary! Please click the button below to verify your email address and complete your account registration.</p>
                                        <div style=""text-align:center; margin: 32px 0;"">
                                            <a href=""{System.Net.WebUtility.HtmlEncode(verifyUrl)}"" style=""background:#00A76F; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:600; display:inline-block;"">Verify Email Address</a>
                                        </div>
                                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                                        <p style=""word-break:break-all; font-size:13px; color:#718096;"">{System.Net.WebUtility.HtmlEncode(verifyUrl)}</p>
                                        <p>This link will expire in 24 hours.</p>
                                    </div>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style=""background:#f7fafc;padding:20px 32px;text-align:center;"">
                                    <p style=""font-size:13px;color:#a0aec0;margin:0;"">
                                        © {DateTime.UtcNow.Year} Edunary. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>";
    }

    public static string BuildResetPasswordTemplate(string fullName, string resetUrl, string siteUrl = "https://edunary.runasp.net/", string logoUrl = "https://res.cloudinary.com/dyuebf69z/image/upload/v1764309386/logo_white_o2fonq.png")
    {
        return $@"
        <!doctype html>
        <html>
        <head>
            <meta charset=""utf-8"" />
            <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
        </head>
        <body style=""margin:0;padding:0;font-family: 'Segoe UI', Arial, sans-serif;background:#fef5f5;"">
            <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                    <td align=""center"" style=""padding:40px 20px;"">
                        <table role=""presentation"" width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);"">
                            <tr>
                                <td style=""background:#00A76F;padding:24px 32px;"">
                                    <div style=""line-height:32px;"">
                                        <img src=""{logoUrl}""
                                            alt=""Logo""
                                            width=""32""
                                            height=""32""
                                            style=""display:inline-block; vertical-align:middle; margin-right:8px; border:0;"" />
                                        <span style=""color:#ffffff; font-size:22px; font-weight:600; vertical-align:middle; display:inline-block; letter-spacing:-0.5px;"">
                                            Edunary
                                        </span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style=""padding:32px;"">
                                    <h2 style=""font-size:18px;font-weight:600;margin:0 0 16px 0;color:#1a202c;"">Reset Your Password</h2>
                                    <div style=""font-size:15px;line-height:1.6;color:#4a5568;"">
                                        <p>Hello {System.Net.WebUtility.HtmlEncode(fullName)},</p>
                                        <p>We received a request to reset your Edunary account password. Click the button below to continue.</p>
                                        <div style=""text-align:center; margin: 32px 0;"">
                                            <a href=""{System.Net.WebUtility.HtmlEncode(resetUrl)}"" style=""background:#00A76F; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:600; display:inline-block;"">Reset Password</a>
                                        </div>
                                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                                        <p style=""word-break:break-all; font-size:13px; color:#718096;"">{System.Net.WebUtility.HtmlEncode(resetUrl)}</p>
                                        <p>If you did not request this, you can safely ignore this email.</p>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style=""background:#f7fafc;padding:20px 32px;text-align:center;"">
                                    <p style=""font-size:13px;color:#a0aec0;margin:0;"">
                                        © {DateTime.UtcNow.Year} Edunary. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>";
    }

    public static string BuildAnnouncementTemplate(string subject, string content, string siteUrl = "https://edunary.runasp.net/", string logoUrl = "https://res.cloudinary.com/dyuebf69z/image/upload/v1764309386/logo_white_o2fonq.png")
    {
        return $@"
        <!doctype html>
        <html>
        <head>
            <meta charset=""utf-8"" />
            <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
        </head>
        <body style=""margin:0;padding:0;font-family: 'Segoe UI', Arial, sans-serif;background:#fef5f5;"">
            <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                    <td align=""center"" style=""padding:40px 20px;"">
                        <table role=""presentation"" width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);"">
                            <!-- Header -->
                            <tr>
                                <td style=""background:#4db8c4;padding:24px 32px;"">
                                    <div style=""line-height:32px;"">
                                        <img src=""{logoUrl}"" 
                                            alt=""Logo"" 
                                            width=""32"" 
                                            height=""32"" 
                                            style=""display:inline-block; vertical-align:middle; margin-right:8px; border:0;"" />
                                        <span style=""color:#ffffff; font-size:22px; font-weight:600; vertical-align:middle; display:inline-block; letter-spacing:-0.5px;"">
                                            Edunary
                                        </span>
                                    </div>
                                </td>
                            </tr>
                            <!-- Content -->
                            <tr>
                                <td style=""padding:32px;"">
                                    <h2 style=""font-size:18px;font-weight:600;margin:0 0 16px 0;color:#1a202c;"">{System.Net.WebUtility.HtmlEncode(subject)}</h2>
                                    <div style=""font-size:15px;line-height:1.6;color:#4a5568;"">
                                        {content}
                                    </div>
                                </td>
                            </tr>
                            <!-- Divider -->
                            <tr>
                                <td style=""padding:0 32px;"">
                                    <div style=""border-top:1px solid #e2e8f0;""></div>
                                </td>
                            </tr>
                            <!-- Footer Note -->
                            <tr>
                                <td style=""padding:24px 32px;"">
                                    <p style=""font-size:13px;color:#718096;margin:0;line-height:1.5;"">
                                        You're receiving this announcement because you're enrolled in a course on Edunary.
                                        To update your notification preferences, please visit your account settings.
                                    </p>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style=""background:#f7fafc;padding:20px 32px;text-align:center;"">
                                    <p style=""font-size:13px;color:#a0aec0;margin:0;"">
                                        © {DateTime.UtcNow.Year} Edunary. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>";
    }
}
