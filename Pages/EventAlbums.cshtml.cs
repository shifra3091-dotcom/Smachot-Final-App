using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SmachotMemories.Models;
using SmachotMemories.Services.Interfaces;

namespace SmachotMemories.Pages
{
    public class EventAlbumsModel : PageModel
    {
        private readonly IAlbumService _albumService;
        private readonly IEventService _eventService;

        public EventAlbumsModel(IAlbumService albumService, IEventService eventService)
        {
            _albumService = albumService;
            _eventService = eventService;
        }

        [BindProperty(SupportsGet = true)]
        public int EventId { get; set; }

        public string EventName { get; set; } = string.Empty;
        public List<Album> Albums { get; set; } = new();

        [BindProperty]
        public string NewAlbumName { get; set; } = string.Empty;

        public async Task OnGetAsync()
        {
            var eventEntity = await _eventService.GetEventByIdAsync(EventId);
            EventName = eventEntity?.EventName ?? "Event";
            Albums = await _albumService.GetAlbumsForEventAsync(EventId);
        }

        public async Task<IActionResult> OnPostCreateAsync()
        {
            if (!string.IsNullOrWhiteSpace(NewAlbumName))
            {
                await _albumService.CreateAlbumAsync(EventId, NewAlbumName);
            }
            return RedirectToPage(new { EventId });
        }

        public async Task<IActionResult> OnPostDeleteAsync(int albumId)
        {
            try
            {
                await _albumService.DeleteAlbumAsync(albumId);
            }
            catch (InvalidOperationException)
            {
                // Album has media items, can't delete
                TempData["Error"] = "Cannot delete album with media items.";
            }
            return RedirectToPage(new { EventId });
        }
    }
}
