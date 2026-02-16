using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;
using MimeKit;
using System.ComponentModel.DataAnnotations;

namespace SmachotMemories.Services.Email
{
    public class EmailSender : IEmailSender
    {
        private readonly EmailSettings _emailSettings;
        private readonly IWebHostEnvironment _env;
        private readonly IServiceScopeFactory serviceScopeFactory;

        public EmailSender(
            IOptions<EmailSettings> emailSettings,
            IWebHostEnvironment env, IServiceScopeFactory serviceScopeFactory)
        {
            _emailSettings = emailSettings.Value;
            _env = env;
            this.serviceScopeFactory = serviceScopeFactory;

        }


        public async Task SendEmailAsync(string email, string subject, string message)
        {
            string[] emailArray = { email };
            //var res = await TrySendEmailAsync("tovakolitz@gmail.com", "tovakolitz@gmail.com", emailArray, emailArray, subject, message, null);
            var res = await TrySendEmailAsync(_emailSettings.SenderName, _emailSettings.Sender, emailArray, emailArray, subject, message);
            if (!res)
                throw new Exception("couldn't send email");
        }
        public enum TypeEmail
        {
            [Display(Name = "אימיילים סיכום חודשי ללקוחות")]
            a = 0,
            [Display(Name = "שליחת מייל ללקוח")]
            b = 1,
            [Display(Name = "הרשמה חדשה")]
            c = 2,
        }




        public async Task<bool> TrySendEmailAsync(string fromName, string fromAddress, string[] toName, string[] toAddress, string subject, string htmlMessage)
        {
            try
            {
                var _emailSettings = this._emailSettings;

                //if (toAddress.Any(x => x.Contains("@walla.co.il", StringComparison.InvariantCultureIgnoreCase)))
                //{
                //    _emailSettings = _emailSettings.WallaEmailSettings;
                //}
                var mimeMessage = new MimeMessage();

                if (string.IsNullOrEmpty(fromName))
                    mimeMessage.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.Sender));
                else
                    mimeMessage.From.Add(new MailboxAddress(fromName, fromAddress));

                if (toName == null)
                    mimeMessage.To.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.Sender));
                else
                    for (int i = 0; i < toName.Length; i++)
                    {
                        if (toName[i] != null && toAddress[i] != null)
                            mimeMessage.To.Add(new MailboxAddress(toName[i], toAddress[i]));
                    }
                //mimeMessage.To.Add(new MailboxAddress("tovakolitz@gmail.com", "tovakolitz@gmail.com"));

                var ccAddress = "nathcuriel@gmail.com";
                //mimeMessage.Cc.Add(new MailboxAddress(ccAddress));
                //if (!string.IsNullOrEmpty(fromName))
                //    mimeMessage.Cc.Add(new MailboxAddress(fromName, fromAddress));
                mimeMessage.Subject = subject;


                mimeMessage.Body = new TextPart("html")
                {
                    Text = htmlMessage
                };
                var builder = new BodyBuilder();
                builder.HtmlBody = htmlMessage.Replace("\r\n", "<br>").Replace("\n", "<br>");

                mimeMessage.Body = builder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    client.ServerCertificateValidationCallback = (s, c, h, e) => true;


                    await client.ConnectAsync(_emailSettings.MailServer, _emailSettings.MailPort,
                        MailKit.Security.SecureSocketOptions.StartTls);

                    if (!String.IsNullOrWhiteSpace(_emailSettings.Login))
                        await client.AuthenticateAsync(_emailSettings.Login, _emailSettings.Password);

                    await client.SendAsync(mimeMessage);

                    //var newEmail = new EmailSent()
                    //{
                    //    Date = DateTime.Now,
                    //    EmailAddress = mimeMessage.To.ToString(),
                    //    EmailSubject = subject,
                    //    EmailHTML = htmlMessage,
                    //};

                    if (toName != null)
                        for (int i = 0; i < toName.Length; i++)
                        {
                            if (toName[i] != null && toAddress[i] != null)
                            {
                                //emails.Add(new EmailSent()
                                //{
                                //    Date = DateTime.Now,
                                //    EmailAddress = toAddress[i],
                                //    EmailSubject = subject,
                                //    EmailHTML = htmlMessage,
                                //});
                            }
                            //mimeMessage.To.Add(new MailboxAddress(toName[i], toAddress[i]));
                        }

                    //_context.SaveChanges();

                    await client.DisconnectAsync(true);
                    return true;
                }
            }

            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }


    }
}
