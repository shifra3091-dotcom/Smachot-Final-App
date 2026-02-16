using QRCoder;
using SmachotMemories.Services.Interfaces;
using System.Drawing;
using System.Drawing.Imaging;

namespace SmachotMemories.Services
{
    public class QRCodeService : IQRCodeService
    {
        private readonly IConfiguration _configuration;

        public QRCodeService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// יוצר QR Code מ-URL ומחזיר אותו כ-byte array
        /// </summary>
        public byte[] GenerateQRCode(string url)
        {
            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            {
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
                using (QRCode qrCode = new QRCode(qrCodeData))
                {
                    using (Bitmap qrCodeImage = qrCode.GetGraphic(20))
                    {
                        using (MemoryStream ms = new MemoryStream())
                        {
                            qrCodeImage.Save(ms, ImageFormat.Png);
                            return ms.ToArray();
                        }
                    }
                }
            }
        }

        /// <summary>
        /// יוצר URL לאירוע עם venueId ו-eventId
        /// </summary>
        public string GenerateEventUrl(string venueId, int eventId)
        {
            var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "https://localhost:7019";
            return $"{baseUrl}/event?v={venueId}&e={eventId}";
        }

        /// <summary>
        /// יוצר URL לאירוע עם קוד ייחודי (מומלץ - פשוט יותר)
        /// </summary>
        public string GenerateEventUrl(int eventUniqueCode)
        {
            //var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "https://localhost:7168";
            var baseUrl = "https://localhost:7168";
            return $"{baseUrl}/EventAtHall/{eventUniqueCode}";
        }
        public string GenerateHallUrl(int hallUniqueCode)
        {
            //var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "https://localhost:7168";
            var baseUrl = "https://localhost:7168";
            return $"{baseUrl}/EventAtHall?HallId={hallUniqueCode}";
        }
    }
}
