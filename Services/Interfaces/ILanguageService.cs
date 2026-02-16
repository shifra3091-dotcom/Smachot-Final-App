namespace SmachotMemories.Services.Interfaces
{
    public interface ILanguageService
    {
        /// <summary>
        /// Gets the current language from the request (query string, route, or Accept-Language header)
        /// </summary>
        string GetCurrentLanguage();

        /// <summary>
        /// Checks if the current language is RTL (right-to-left)
        /// </summary>
        bool IsRTL();

        /// <summary>
        /// Checks if JavaScript interop is available
        /// </summary>
        bool IsJsInteropAvailable();

        /// <summary>
        /// Gets the browser's language
        /// </summary>
        Task<string> GetBrowserLanguageAsync();

        Task<string> GetDeviceLanguageAsync();
        Task<bool> IsRTLAsync();
        string GetSupportedLanguage(string detectedLanguage);
    }
}
