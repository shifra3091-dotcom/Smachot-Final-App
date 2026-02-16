using Microsoft.AspNetCore.Http;
using SmachotMemories.Services.Interfaces;

namespace SmachotMemories.Services
{
    public class LanguageService : ILanguageService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly List<string> _supportedLanguages = new() { "he", "en", "fr","ru" ,"ar"};
        private const string DefaultLanguage = "he";
        private static readonly HashSet<string> RtlLanguages = new() { "he", "ar", "fa", "ur" };

        public LanguageService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Gets the current language from the request (query string, route, or Accept-Language header)
        /// Priority: 1. Query string (?lang=en), 2. Route parameter, 3. Accept-Language header, 4. Default
        /// </summary>
        public string GetCurrentLanguage()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                return DefaultLanguage;
            }

            // 1. Check query string (e.g., ?lang=en)
            if (httpContext.Request.Query.TryGetValue("lang", out var langQuery))
            {
                var lang = GetSupportedLanguage(langQuery.ToString());
                if (lang != DefaultLanguage || _supportedLanguages.Contains(langQuery.ToString().ToLower()))
                {
                    return lang;
                }
            }

            // 2. Check route data (e.g., /en/page or /{lang}/page)
            if (httpContext.Request.RouteValues.TryGetValue("lang", out var langRoute) && langRoute != null)
            {
                var lang = GetSupportedLanguage(langRoute.ToString()!);
                if (lang != DefaultLanguage || _supportedLanguages.Contains(langRoute.ToString()!.ToLower()))
                {
                    return lang;
                }
            }

            // 3. Check Accept-Language header from browser
            var acceptLanguage = httpContext.Request.Headers.AcceptLanguage.FirstOrDefault();
            if (!string.IsNullOrEmpty(acceptLanguage))
            {
                // Parse Accept-Language header (e.g., "en-US,en;q=0.9,he;q=0.8")
                var languages = acceptLanguage.Split(',')
                    .Select(l => l.Split(';')[0].Trim().Split('-')[0].ToLower())
                    .ToList();

                foreach (var lang in languages)
                {
                    if (_supportedLanguages.Contains(lang))
                    {
                        return lang;
                    }
                }
            }

            return DefaultLanguage;
        }

        /// <summary>
        /// Gets the current language (async version for interface compatibility)
        /// </summary>
        public Task<string> GetDeviceLanguageAsync()
        {
            return Task.FromResult(GetCurrentLanguage());
        }

        /// <summary>
        /// Gets the browser's language from Accept-Language header
        /// </summary>
        public Task<string> GetBrowserLanguageAsync()
        {
            return Task.FromResult(GetCurrentLanguage());
        }

        /// <summary>
        /// Checks if the current language is RTL (right-to-left)
        /// </summary>
        public bool IsRTL()
        {
            var currentLang = GetCurrentLanguage();
            return RtlLanguages.Contains(currentLang);
        }

        /// <summary>
        /// Checks if the current language is RTL (async version for interface compatibility)
        /// </summary>
        public Task<bool> IsRTLAsync()
        {
            return Task.FromResult(IsRTL());
        }

        /// <summary>
        /// Returns a supported language or the default
        /// </summary>
        public string GetSupportedLanguage(string detectedLanguage)
        {
            if (string.IsNullOrEmpty(detectedLanguage))
                return DefaultLanguage;

            var lang = detectedLanguage.ToLower().Trim();

            return _supportedLanguages.Contains(lang) ? lang : DefaultLanguage;
        }

        /// <summary>
        /// Always returns true since we're using HTTP context (no JS interop needed)
        /// </summary>
        public bool IsJsInteropAvailable() => true;
    }
}
