using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SmachotMemories.Models;
using SmachotMemories.Services.Interfaces;

namespace SmachotMemories.Pages
{
    public class EventMediaItemsModel : PageModel
    {
        private readonly IMediaService _mediaService;
        private readonly IAlbumService _albumService;
        private readonly IEventService _eventService;

        public EventMediaItemsModel(IMediaService mediaService, IAlbumService albumService, IEventService eventService)
        {
            _mediaService = mediaService;
            _albumService = albumService;
            _eventService = eventService;
        }

        [BindProperty(SupportsGet = true)]
        public int EventId { get; set; }

        [BindProperty(SupportsGet = true)]
        public int? AlbumId { get; set; }

        public string EventName { get; set; } = string.Empty;
        public string? AlbumName { get; set; }
        public List<Media> MediaItems { get; set; } = new();
        public List<Album> Albums { get; set; } = new();

        public async Task<IActionResult> OnGetAsync()
        {
            var eventDto = await _eventService.GetEventByIdAsync(EventId);
            if (eventDto == null)
            {
                return NotFound();
            }

            EventName = eventDto.EventName;
            Albums = await _albumService.GetAlbumsForEventAsync(EventId);

            // Get all media for the event
            var allMedia = await _mediaService.GetAllMediaForEventAsync(EventId);

            // Filter by album if AlbumId is provided
            if (AlbumId.HasValue)
            {
                var album = Albums.FirstOrDefault(a => a.AlbumId == AlbumId.Value);
                AlbumName = album?.Name;
                MediaItems = allMedia.Where(m => m.Albums.Any(a => a.AlbumId == AlbumId.Value)).ToList();
            }
            else
            {
                MediaItems = allMedia;
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAddToAlbumAsync(int eventId, int? albumId, int mediaId, int albumIdToAdd)
        {
            var result = await _mediaService.AddMediaToAlbumAsync(mediaId, albumIdToAdd);
            if (!result)
            {
                TempData["Error"] = "Failed to add media to album.";
            }

            return RedirectToPage(new { EventId = eventId, AlbumId = albumId });
        }

        public async Task<IActionResult> OnPostRemoveFromAlbumAsync(int eventId, int? albumId, int mediaId, int albumIdToRemove)
        {
            var result = await _mediaService.RemoveMediaFromAlbumAsync(mediaId, albumIdToRemove);
            if (!result)
            {
                TempData["Error"] = "Failed to remove media from album.";
            }

            return RedirectToPage(new { EventId = eventId, AlbumId = albumId });
        }

        public async Task<IActionResult> OnPostSetAlbumsAsync(int eventId, int? albumId, int mediaId, List<int> albumIds)
        {
            var result = await _mediaService.SetMediaAlbumsAsync(mediaId, albumIds ?? new List<int>());
            if (!result)
            {
                TempData["Error"] = "Failed to update media albums.";
            }

            return RedirectToPage(new { EventId = eventId, AlbumId = albumId });
        }

        public async Task<IActionResult> OnPostDownloadAllAsync(int eventId, int? albumId)
        {
            var result = await _mediaService.CreateMediaZipAsync(eventId, albumId);
            
            if (result == null)
            {
                TempData["Error"] = "No media files found to download.";
                return RedirectToPage(new { EventId = eventId, AlbumId = albumId });
            }

            return File(result.Value.zipBytes, "application/zip", result.Value.fileName);
        }

        public async Task<IActionResult> OnPostDeleteMediaAsync(int eventId, int? albumId, int mediaId)
        {
            var result = await _mediaService.DeleteMediaAsync(mediaId);
            if (!result)
            {
                TempData["Error"] = "Failed to delete media item.";
            }
            else
            {
                TempData["Success"] = "Media item deleted successfully.";
            }

            return RedirectToPage(new { EventId = eventId, AlbumId = albumId });
        }
    }
}
