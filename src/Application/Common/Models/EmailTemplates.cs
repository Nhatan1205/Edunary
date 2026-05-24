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
                                        Â© {DateTime.UtcNow.Year} Edunary. All rights reserved.
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
                                        Â© {DateTime.UtcNow.Year} Edunary. All rights reserved.
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

    public static string BuildAnnouncementTemplate(
        string userName,
        string instructorName,
        string instructorAvatar,
        string courseName,
        string courseUrl,
        string subject,
        string content,
        string actionUrl,
        string logoUrl = "https://res.cloudinary.com/dyuebf69z/image/upload/v1778492480/logo_brand_o2fonq_o1hqzz.png")
    {
        var encodedUserName = System.Net.WebUtility.HtmlEncode(userName);
        var encodedInstructorName = System.Net.WebUtility.HtmlEncode(instructorName);
        var encodedCourseName = System.Net.WebUtility.HtmlEncode(courseName);

        return $@"<!doctype html>
        <html lang=""en"">
        <head>
          <meta charset=""utf-8"" />
          <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
        </head>
        <body style=""margin:0;padding:0;background:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1c1d1f;"">
          <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;"">
            <tr>
              <td align=""center"" style=""padding:32px 20px 0;"">
                <table role=""presentation"" width=""560"" cellpadding=""0"" cellspacing=""0"">

                  <!-- Header Row -->
                  <tr>
                    <td style=""padding-bottom:28px;"">
                      <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                        <tr>
                          <td align=""left"" style=""vertical-align:middle;"">
                            <p style=""margin:0;font-size:17px;font-weight:700;color:#1c1d1f;"">New Announcement</p>
                          </td>
                          <td align=""right"" style=""vertical-align:middle;"">
                            <img src=""{logoUrl}"" alt=""Edunary"" width=""32"" height=""32""
                              style=""display:inline-block;vertical-align:middle;margin-right:6px;border:0;"" />
                            <span style=""font-size:20px;font-weight:700;vertical-align:middle;color:#00A76F;"">Edunary</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr><td style=""border-top:1px solid #e8e8e8;padding-bottom:24px;""></td></tr>

                  <!-- Instructor greeting row -->
                  <tr>
                    <td style=""padding-bottom:24px;"">
                      <table role=""presentation"" cellpadding=""0"" cellspacing=""0"">
                        <tr>
                          <td style=""vertical-align:top;padding-right:12px;"">
                            {(string.IsNullOrEmpty(instructorAvatar)
                                ? $"<div style=\"width:40px;height:40px;border-radius:50%;background:#00A76F;display:inline-block;\"></div>"
                                : $"<img src=\"{instructorAvatar}\" alt=\"{encodedInstructorName}\" width=\"40\" height=\"40\" style=\"border-radius:50%;display:block;border:0;\" />")}
                          </td>
                          <td style=""vertical-align:middle;"">
                            <p style=""margin:0;font-size:14px;line-height:1.5;color:#1c1d1f;"">
                              Hi {encodedUserName}, an announcement has been made from
                              <strong>{encodedInstructorName}</strong> of
                              <a href=""{courseUrl}"" style=""color:#00A76F;text-decoration:none;font-weight:600;"">{encodedCourseName}</a>.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr><td style=""border-top:1px solid #e8e8e8;padding-bottom:24px;""></td></tr>

                  <!-- Announcement subject -->
                  <tr>
                    <td style=""padding-bottom:16px;"">
                      <p style=""margin:0;font-size:16px;font-weight:700;color:#1c1d1f;"">{System.Net.WebUtility.HtmlEncode(subject)}</p>
                    </td>
                  </tr>

                  <!-- Announcement content -->
                  <tr>
                    <td style=""padding-bottom:32px;"">
                      <div style=""font-size:15px;line-height:1.6;color:#4a5568;"">
                        {content}
                      </div>
                    </td>
                  </tr>

                  <!-- CTA -->
                  <tr>
                    <td style=""padding-bottom:32px;"">
                      <table role=""presentation"" cellpadding=""0"" cellspacing=""0"">
                        <tr>
                          <td style=""border-radius:4px;background:#00A76F;"">
                            <a href=""{actionUrl}"" style=""display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:4px;"">
                              See Announcement
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr><td style=""border-top:3px solid #e8e8e8;padding-top:24px;padding-bottom:8px;""></td></tr>

                  <!-- Footer -->
                  <tr>
                    <td style=""padding-bottom:32px;"">
                      <p style=""margin:0;font-size:12px;line-height:1.6;color:#6a6f73;"">
                        You're receiving this email because you are enrolled in a course on Edunary.<br/>
                        &copy; {DateTime.UtcNow.Year} Edunary Inc.
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

    public static string BuildNewQuestionTemplate(string courseName, string questionTitle, string actionUrl, string logoUrl = "https://res.cloudinary.com/dyuebf69z/image/upload/v1778492480/logo_brand_o2fonq_o1hqzz.png")
    {
        var encodedCourse = System.Net.WebUtility.HtmlEncode(courseName);
        var encodedTitle = System.Net.WebUtility.HtmlEncode(questionTitle);

        return $@"<!doctype html>
        <html lang=""en"">
        <head>
          <meta charset=""utf-8"" />
          <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
        </head>
        <body style=""margin:0;padding:0;background:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1c1d1f;"">
          <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;"">
            <tr>
              <td align=""center"" style=""padding:32px 20px 0;"">
                <table role=""presentation"" width=""560"" cellpadding=""0"" cellspacing=""0"">

                  <!-- Logo -->
                  <tr>
                    <td style=""padding-bottom:28px;"">
                      <img src=""{logoUrl}"" alt=""Edunary"" width=""32"" height=""32""
                        style=""display:inline-block;vertical-align:middle;margin-right:6px;border:0;"" />
                      <span style=""font-size:20px;font-weight:700;vertical-align:middle;color:#00A76F;"">Edunary</span>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr><td style=""border-top:1px solid #e8e8e8;padding-bottom:28px;""></td></tr>

                  <!-- Body -->
                  <tr>
                    <td style=""padding-bottom:32px;"">
                      <p style=""margin:0 0 16px;font-size:15px;line-height:1.6;color:#1c1d1f;"">
                        There is a new question in your course <strong>{encodedCourse}</strong>
                      </p>
                      <p style=""margin:0 0 24px;font-size:15px;line-height:1.6;color:#6a6f73;"">
                        &ldquo;{encodedTitle}&rdquo;
                      </p>
                      <p style=""margin:0 0 24px;font-size:15px;line-height:1.6;color:#1c1d1f;"">
                        Head over to your Q&amp;A dashboard to review and respond.
                      </p>

                      <!-- CTA -->
                      <table role=""presentation"" cellpadding=""0"" cellspacing=""0"">
                        <tr>
                          <td style=""border-radius:4px;background:#00A76F;"">
                            <a href=""{actionUrl}"" style=""display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:4px;"">
                              Go to Q&amp;A Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr><td style=""border-top:3px solid #e8e8e8;padding-top:24px;padding-bottom:8px;""></td></tr>

                  <!-- Footer -->
                  <tr>
                    <td style=""padding-bottom:32px;"">
                      <p style=""margin:0;font-size:12px;line-height:1.6;color:#6a6f73;"">
                        You're receiving this email because you are an instructor on Edunary.<br/>
                        &copy; {DateTime.UtcNow.Year} Edunary Inc.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        ";
    }

    public static string BuildNewAnswerTemplate(string courseName, string questionTitle, bool isInstructorAnswer, string actionUrl, string logoUrl = "https://res.cloudinary.com/dyuebf69z/image/upload/v1778492480/logo_brand_o2fonq_o1hqzz.png")
    {
        var encodedCourse = System.Net.WebUtility.HtmlEncode(courseName);
        var encodedTitle = System.Net.WebUtility.HtmlEncode(questionTitle);

        var bodyLine = isInstructorAnswer
            ? $"There is a new response from the <strong>instructor</strong> to &ldquo;{encodedTitle}&rdquo; in your course <strong>{encodedCourse}</strong>"
            : $"There is a new response to &ldquo;{encodedTitle}&rdquo; in your course <strong>{encodedCourse}</strong>";

        var subLine = isInstructorAnswer
            ? "Use the button below to see the instructor's reply."
            : "Use the button below to see the response and indicate if it was helpful.";

        return $@"<!doctype html>
        <html lang=""en"">
        <head>
          <meta charset=""utf-8"" />
          <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
        </head>
        <body style=""margin:0;padding:0;background:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1c1d1f;"">
          <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;"">
            <tr>
              <td align=""center"" style=""padding:32px 20px 0;"">
                <table role=""presentation"" width=""560"" cellpadding=""0"" cellspacing=""0"">

                  <!-- Logo -->
                  <tr>
                    <td style=""padding-bottom:28px;"">
                      <img src=""{logoUrl}"" alt=""Edunary"" width=""32"" height=""32""
                        style=""display:inline-block;vertical-align:middle;margin-right:6px;border:0;"" />
                      <span style=""font-size:20px;font-weight:700;vertical-align:middle;color:#00A76F;"">Edunary</span>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr><td style=""border-top:1px solid #e8e8e8;padding-bottom:28px;""></td></tr>

                  <!-- Body -->
                  <tr>
                    <td style=""padding-bottom:32px;"">
                      <p style=""margin:0 0 16px;font-size:15px;line-height:1.6;color:#1c1d1f;"">
                        {bodyLine}
                      </p>
                      <p style=""margin:0 0 24px;font-size:15px;line-height:1.6;color:#6a6f73;"">
                        {subLine}
                      </p>

                      <!-- CTA -->
                      <table role=""presentation"" cellpadding=""0"" cellspacing=""0"">
                        <tr>
                          <td style=""border-radius:4px;background:#00A76F;"">
                            <a href=""{actionUrl}"" style=""display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:4px;"">
                              See Response
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr><td style=""border-top:3px solid #e8e8e8;padding-top:24px;padding-bottom:8px;""></td></tr>

                  <!-- Footer -->
                  <tr>
                    <td style=""padding-bottom:32px;"">
                      <p style=""margin:0;font-size:12px;line-height:1.6;color:#6a6f73;"">
                        You're receiving this email because you asked a question on Edunary.<br/>
                        &copy; {DateTime.UtcNow.Year} Edunary Inc.
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

    public static string BuildCourseNeedsChangesTemplate(
        string instructorName,
        string courseTitle,
        string adminNote,
        string actionUrl,
        string logoUrl = "https://res.cloudinary.com/dyuebf69z/image/upload/v1778492480/logo_brand_o2fonq_o1hqzz.png")
    {
        var encodedInstructor = System.Net.WebUtility.HtmlEncode(instructorName);
        var encodedCourse = System.Net.WebUtility.HtmlEncode(courseTitle);
        var encodedNote = System.Net.WebUtility.HtmlEncode(adminNote ?? string.Empty);

        return $@"<!doctype html>
        <html lang=""en"">
        <head>
          <meta charset=""utf-8"" />
          <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
        </head>
        <body style=""margin:0;padding:0;background:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1c1d1f;"">
          <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;"">
            <tr>
              <td align=""center"" style=""padding:32px 20px 0;"">
                <table role=""presentation"" width=""560"" cellpadding=""0"" cellspacing=""0"">
                  <!-- Logo -->
                  <tr>
                    <td style=""padding-bottom:24px;"">
                      <img src=""{logoUrl}"" alt=""Edunary"" width=""32"" height=""32""
                        style=""display:inline-block;vertical-align:middle;margin-right:6px;border:0;"" />
                      <span style=""font-size:20px;font-weight:700;vertical-align:middle;color:#00A76F;"">Edunary</span>
                    </td>
                  </tr>
                  <!-- Divider -->
                  <tr><td style=""border-top:1px solid #e8e8e8;padding-bottom:24px;""></td></tr>
                  <!-- Status badge -->
                  <tr>
                    <td style=""padding-bottom:20px;"">
                      <span style=""background:#FFF3CD;color:#856404;font-size:13px;font-weight:600;padding:4px 12px;border-radius:20px;"">Changes Required</span>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style=""padding-bottom:24px;"">
                      <p style=""margin:0 0 12px;font-size:15px;line-height:1.6;color:#1c1d1f;"">
                        Hi <strong>{encodedInstructor}</strong>,
                      </p>
                      <p style=""margin:0 0 12px;font-size:15px;line-height:1.6;color:#1c1d1f;"">
                        Your course <strong>&ldquo;{encodedCourse}&rdquo;</strong> has been reviewed and requires changes before it can be published.
                      </p>
                      {(string.IsNullOrWhiteSpace(adminNote) ? "" : $@"<div style=""background:#f8f9fa;border-left:4px solid #ffc107;padding:12px 16px;border-radius:4px;margin-bottom:16px;"">
                        <p style=""margin:0;font-size:14px;color:#6a6f73;font-style:italic;"">&ldquo;{encodedNote}&rdquo;</p>
                      </div>")}
                      <p style=""margin:0 0 20px;font-size:14px;color:#6a6f73;"">
                        Please address the feedback items in your instructor dashboard, then resubmit for review.
                      </p>
                      <table role=""presentation"" cellpadding=""0"" cellspacing=""0"">
                        <tr>
                          <td style=""border-radius:4px;background:#00A76F;"">
                            <a href=""{actionUrl}"" style=""display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:4px;"">
                              View Feedback
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Divider -->
                  <tr><td style=""border-top:3px solid #e8e8e8;padding-top:20px;""></td></tr>
                  <!-- Footer -->
                  <tr>
                    <td style=""padding-bottom:32px;"">
                      <p style=""margin:0;font-size:12px;color:#6a6f73;"">
                        You're receiving this email because you submitted a course for review on Edunary.<br/>
                        &copy; {DateTime.UtcNow.Year} Edunary Inc.
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

    public static string BuildCourseApprovedTemplate(
        string instructorName,
        string courseTitle,
        string courseUrl,
        string logoUrl = "https://res.cloudinary.com/dyuebf69z/image/upload/v1778492480/logo_brand_o2fonq_o1hqzz.png")
    {
        var encodedInstructor = System.Net.WebUtility.HtmlEncode(instructorName);
        var encodedCourse = System.Net.WebUtility.HtmlEncode(courseTitle);

        return $@"<!doctype html>
        <html lang=""en"">
        <head>
          <meta charset=""utf-8"" />
          <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
        </head>
        <body style=""margin:0;padding:0;background:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1c1d1f;"">
          <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;"">
            <tr>
              <td align=""center"" style=""padding:32px 20px 0;"">
                <table role=""presentation"" width=""560"" cellpadding=""0"" cellspacing=""0"">
                  <!-- Logo -->
                  <tr>
                    <td style=""padding-bottom:24px;"">
                      <img src=""{logoUrl}"" alt=""Edunary"" width=""32"" height=""32""
                        style=""display:inline-block;vertical-align:middle;margin-right:6px;border:0;"" />
                      <span style=""font-size:20px;font-weight:700;vertical-align:middle;color:#00A76F;"">Edunary</span>
                    </td>
                  </tr>
                  <!-- Divider -->
                  <tr><td style=""border-top:1px solid #e8e8e8;padding-bottom:24px;""></td></tr>
                  <!-- Status badge -->
                  <tr>
                    <td style=""padding-bottom:20px;"">
                      <span style=""background:#D4EDDA;color:#155724;font-size:13px;font-weight:600;padding:4px 12px;border-radius:20px;"">🎉 Approved & Published</span>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style=""padding-bottom:24px;"">
                      <p style=""margin:0 0 12px;font-size:15px;line-height:1.6;color:#1c1d1f;"">
                        Congratulations <strong>{encodedInstructor}</strong>!
                      </p>
                      <p style=""margin:0 0 20px;font-size:15px;line-height:1.6;color:#1c1d1f;"">
                        Your course <strong>&ldquo;{encodedCourse}&rdquo;</strong> has been approved and is now live on the Edunary marketplace. Students can now find and enroll in your course.
                      </p>
                      <table role=""presentation"" cellpadding=""0"" cellspacing=""0"">
                        <tr>
                          <td style=""border-radius:4px;background:#00A76F;"">
                            <a href=""{courseUrl}"" style=""display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:4px;"">
                              View Your Course
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Divider -->
                  <tr><td style=""border-top:3px solid #e8e8e8;padding-top:20px;""></td></tr>
                  <!-- Footer -->
                  <tr>
                    <td style=""padding-bottom:32px;"">
                      <p style=""margin:0;font-size:12px;color:#6a6f73;"">
                        You're receiving this email because you submitted a course for review on Edunary.<br/>
                        &copy; {DateTime.UtcNow.Year} Edunary Inc.
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

    public static string BuildCourseUnpublishedTemplate(
        string instructorName,
        string courseTitle,
        string reason,
        string actionUrl,
        string logoUrl = "https://res.cloudinary.com/dyuebf69z/image/upload/v1778492480/logo_brand_o2fonq_o1hqzz.png")
    {
        var encodedInstructor = System.Net.WebUtility.HtmlEncode(instructorName);
        var encodedCourse = System.Net.WebUtility.HtmlEncode(courseTitle);
        var encodedReason = System.Net.WebUtility.HtmlEncode(reason ?? string.Empty);

        return $@"<!doctype html>
        <html lang=""en"">
        <head>
          <meta charset=""utf-8"" />
          <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
        </head>
        <body style=""margin:0;padding:0;background:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1c1d1f;"">
          <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;"">
            <tr>
              <td align=""center"" style=""padding:32px 20px 0;"">
                <table role=""presentation"" width=""560"" cellpadding=""0"" cellspacing=""0"">
                  <!-- Logo -->
                  <tr>
                    <td style=""padding-bottom:24px;"">
                      <img src=""{logoUrl}"" alt=""Edunary"" width=""32"" height=""32""
                        style=""display:inline-block;vertical-align:middle;margin-right:6px;border:0;"" />
                      <span style=""font-size:20px;font-weight:700;vertical-align:middle;color:#00A76F;"">Edunary</span>
                    </td>
                  </tr>
                  <!-- Divider -->
                  <tr><td style=""border-top:1px solid #e8e8e8;padding-bottom:24px;""></td></tr>
                  <!-- Status badge -->
                  <tr>
                    <td style=""padding-bottom:20px;"">
                      <span style=""background:#F8D7DA;color:#721C24;font-size:13px;font-weight:600;padding:4px 12px;border-radius:20px;"">Course Unpublished</span>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style=""padding-bottom:24px;"">
                      <p style=""margin:0 0 12px;font-size:15px;line-height:1.6;color:#1c1d1f;"">
                        Hi <strong>{encodedInstructor}</strong>,
                      </p>
                      <p style=""margin:0 0 12px;font-size:15px;line-height:1.6;color:#1c1d1f;"">
                        Your course <strong>&ldquo;{encodedCourse}&rdquo;</strong> has been unpublished by our admin team and is no longer visible in the marketplace.
                      </p>
                      {(string.IsNullOrWhiteSpace(reason) ? "" : $@"<div style=""background:#f8f9fa;border-left:4px solid #dc3545;padding:12px 16px;border-radius:4px;margin-bottom:16px;"">
                        <p style=""margin:0;font-size:14px;color:#6a6f73;""><strong>Reason:</strong> {encodedReason}</p>
                      </div>")}
                      <p style=""margin:0 0 20px;font-size:14px;color:#6a6f73;"">
                        Existing enrolled students can still access the course content. To re-publish, please address any concerns and submit the course for review again.
                      </p>
                      <table role=""presentation"" cellpadding=""0"" cellspacing=""0"">
                        <tr>
                          <td style=""border-radius:4px;background:#00A76F;"">
                            <a href=""{actionUrl}"" style=""display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:4px;"">
                              Go to Course Management
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Divider -->
                  <tr><td style=""border-top:3px solid #e8e8e8;padding-top:20px;""></td></tr>
                  <!-- Footer -->
                  <tr>
                    <td style=""padding-bottom:32px;"">
                      <p style=""margin:0;font-size:12px;color:#6a6f73;"">
                        You're receiving this email because you are an instructor on Edunary.<br/>
                        &copy; {DateTime.UtcNow.Year} Edunary Inc.
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

    public static string BuildCollaboratorInvitationTemplate(string ownerName, string courseTitle, string invitationsUrl, string logoUrl = "https://res.cloudinary.com/dyuebf69z/image/upload/v1778492480/logo_brand_o2fonq_o1hqzz.png")
    {
        var encodedOwner = System.Net.WebUtility.HtmlEncode(ownerName);
        var encodedCourse = System.Net.WebUtility.HtmlEncode(courseTitle);
        return $@"<!doctype html>
        <html lang=""en"">
        <head>
          <meta charset=""utf-8"" />
          <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
        </head>
        <body style=""margin:0;padding:0;background:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1c1d1f;"">
          <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;"">
            <tr>
              <td align=""center"" style=""padding:32px 20px 0;"">
                <table role=""presentation"" width=""560"" cellpadding=""0"" cellspacing=""0"">

                  <!-- Logo -->
                  <tr>
                    <td style=""padding-bottom:24px;"">
                      <img src=""{logoUrl}"" alt=""Edunary"" width=""32"" height=""32""
                        style=""display:inline-block;vertical-align:middle;margin-right:6px;border:0;"" />
                      <span style=""font-size:20px;font-weight:700;vertical-align:middle;color:#00A76F;"">Edunary</span>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr><td style=""border-top:1px solid #e8e8e8;padding-bottom:24px;""></td></tr>

                  <!-- Body -->
                  <tr>
                    <td style=""padding-bottom:24px;"">
                      <p style=""margin:0 0 12px;font-size:15px;line-height:1.6;color:#1c1d1f;"">
                        <strong>{encodedOwner}</strong> invited you to collaborate on
                        <strong>&ldquo;{encodedCourse}&rdquo;</strong>.
                      </p>
                      <p style=""margin:0 0 20px;font-size:14px;color:#6a6f73;"">
                        Log in to your instructor dashboard to accept or decline.
                      </p>
                      <table role=""presentation"" cellpadding=""0"" cellspacing=""0"">
                        <tr>
                          <td style=""border-radius:4px;background:#00A76F;"">
                            <a href=""{invitationsUrl}""
                               style=""display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:4px;"">
                              View Invitation
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr><td style=""border-top:3px solid #e8e8e8;padding-top:20px;""></td></tr>

                  <!-- Footer -->
                  <tr>
                    <td style=""padding-bottom:32px;"">
                      <p style=""margin:0;font-size:12px;color:#6a6f73;"">
                        If you did not expect this, you can safely ignore this email.<br/>
                        &copy; {DateTime.UtcNow.Year} Edunary Inc.
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
