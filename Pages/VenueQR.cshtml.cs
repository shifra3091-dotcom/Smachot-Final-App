using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SmachotMemories.Services;
using SmachotMemories.Services.Interfaces;

namespace SmachotMemories.Pages
{
    public class VenueQRModel : PageModel
    {
        private readonly IQRCodeService QRCodeService;
        private readonly ILanguageService LanguageService;

        public VenueQRModel(IQRCodeService qRCodeService, ILanguageService languageService)
        {
            QRCodeService = qRCodeService;
            LanguageService = languageService;
        }

        [BindProperty(SupportsGet = true)]
        public int EventId { get; set; }
        public string QrUrl { get; set; }
        public byte[]? QrCodeImage { get; set; }

        public string CurrentLanguage = "he";
        public bool IsRTL = true;

        public void OnGet()
        {
            // Get language from query string (?lang=en), route, or Accept-Language header
            CurrentLanguage = LanguageService.GetCurrentLanguage();
            IsRTL = LanguageService.IsRTL();

            QrUrl = QRCodeService.GenerateEventUrl(EventId);
            QrCodeImage = QRCodeService.GenerateQRCode(QrUrl);
        }
    }
}
