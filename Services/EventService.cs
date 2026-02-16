using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmachotMemories.Data;
using SmachotMemories.DTOs;
using SmachotMemories.Models;
using SmachotMemories.Services.Interfaces;

namespace SmachotMemories.Services
{
    public class EventService : IEventService
    {
        private readonly SmachotContext _context;
        private readonly IWebHostEnvironment _env;

        public EventService(SmachotContext db, IWebHostEnvironment env)
        {
            _context = db;
            _env = env;
        }

        public async Task<Event> CreateEventAsync(int ownerUserId, CreateEventDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.EventName))
                throw new ArgumentException("Event name is required");

            var ev = new Event
            {
                EventName = dto.EventName,
                EventStartDate = dto.EventDate,
                BackgroundImageUrl = dto.BackgroundImageUrl,
                HallId = dto.HallId,
                OwnerUserId = ownerUserId,
                //IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Events.Add(ev);
            await _context.SaveChangesAsync();

            return ev;
        }

        public async Task<Event> CreateEventWithAlbumsAsync(int ownerUserId, CreateEventDto dto, List<string> albums, [FromForm] IFormFile? eventImage)
        {

            if (eventImage != null && eventImage.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName =dto.EventName +  Guid.NewGuid().ToString() + Path.GetExtension(eventImage.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await eventImage.CopyToAsync(stream);
                }

                dto.BackgroundImageUrl = $"uploads/{fileName}";
            }


            if (string.IsNullOrWhiteSpace(dto.EventName))
                throw new ArgumentException("Event name is required");

            EventType? eventType = null;
            if (dto.EventTypeId.HasValue)
            {
                eventType = await _context.EventTypes.FindAsync(dto.EventTypeId.Value);
                if (eventType == null)
                    throw new ArgumentException("Invalid EventTypeId");
            }

            var ev = new Event
            {
                EventName = dto.EventName,
                EventStartDate = dto.EventDate,
                BackgroundImageUrl = dto.BackgroundImageUrl,
                HallId = dto.HallId,
                OwnerUserId = ownerUserId,
                //IsActive = true,
                CreatedAt = DateTime.Now,
                EventType = eventType,
                Albums = new List<Album>()
            };

            foreach (var albumName in albums)
            {
                var albumObj = new Album
                {
                    Name = albumName,
                    Event = ev,
                    CreatedAt = DateTime.Now
                };
                ev.Albums.Add(albumObj);
            }

            _context.Events.Add(ev);
            await _context.SaveChangesAsync();

            return ev;
        }
        public async Task<Event> UpdateEventWithAlbumsAsync(int eventId, CreateEventDto dto, List<string> albums, IFormFile? eventImage)
        {
            var existingEvent = await _context.Events.Include(e => e.Albums).FirstOrDefaultAsync(e => e.EventId == eventId);
            if (existingEvent == null)
                throw new ArgumentException("Event not found");

            if (eventImage != null && eventImage.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = dto.EventName + Guid.NewGuid().ToString() + Path.GetExtension(eventImage.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await eventImage.CopyToAsync(stream);
                }

                dto.BackgroundImageUrl = $"uploads/{fileName}";
            }

            if (string.IsNullOrWhiteSpace(dto.EventName))
                throw new ArgumentException("Event name is required");

            EventType? eventType = null;
            if (dto.EventTypeId.HasValue)
            {
                eventType = await _context.EventTypes.FindAsync(dto.EventTypeId.Value);
                if (eventType == null)
                    throw new ArgumentException("Invalid EventTypeId");
            }

            existingEvent.EventName = dto.EventName;
            existingEvent.EventStartDate = dto.EventDate;
            //existingEvent.EventEndDate = dto.EventDate;???
            existingEvent.BackgroundImageUrl = dto.BackgroundImageUrl ?? existingEvent.BackgroundImageUrl;
            existingEvent.HallId = dto.HallId;
            existingEvent.EventType = eventType;

            _context.Albums.RemoveRange(existingEvent.Albums);

            existingEvent.Albums = new List<Album>();
            foreach (var albumName in albums)
            {
                var albumObj = new Album
                {
                    Name = albumName,
                    Event = existingEvent,
                    CreatedAt = DateTime.Now
                };
                existingEvent.Albums.Add(albumObj);
            }

            await _context.SaveChangesAsync();
            return existingEvent;
        }
        public async Task<Event?> GetEventByIdAsync(int eventId)
        {

            var result= await _context.Events
             .FirstOrDefaultAsync(e => e.EventId == eventId);
            return result;


        }

        public async Task<List<Event>> GetAllEventsAsync()
        {
            return await _context.Events
                .Include(e => e.Albums)
                .ToListAsync();
        }

        public async Task<List<EventDto>> GetEventsForUserAsync(int ownerUserId)
        {
            var f = _context.Events
                .Include(x => x.Hall)
                .Include(e => e.MediaItems).First(x => x.EventId == 1);
            return await _context.Events
                .Include(x=>x.Hall)
                .Include(x=>x.Albums)
                .ThenInclude(e => e.MediaItems)
                .Include(e => e.GoldenBookEntries)
                .Include(e => e.Payments)
                .Where(e => e.OwnerUserId == ownerUserId)
                .OrderByDescending(e => e.EventStartDate)
                .Select(x=>new EventDto
                {
                    EventId = x.EventId,
                    EventName = x.EventName,
                    EventStartDate = x.EventStartDate,
                    EventEndDate = x.EventEndDate,
                    BackgroundImageUrl = x.BackgroundImageUrl,
                    HallName = x.Hall.Name,
                    VideoCount = x.Albums.SelectMany(x=>x.MediaItems).Where(x=>x.MediaType == Models.Enums.MediaTypeEnum.Video).Count(),
                    ImagesCount = x.Albums.SelectMany(x => x.MediaItems).Where(x=>x.MediaType == Models.Enums.MediaTypeEnum.Image).Count(),
                    GoldenBookEntriesCount = x.GoldenBookEntries.Count(),
                    SumPayments = (decimal)x.Payments.Sum(x=>x.Sum)
                })
                .ToListAsync();
        }

        public async Task UpdateEventAsync(int eventId, UpdateEventDto dto)
        {
            var ev = await _context.Events.FirstOrDefaultAsync(e => e.EventId == eventId);
            if (ev == null)
                throw new InvalidOperationException("Event not found");

            ev.EventName = dto.EventName;
            ev.EventStartDate = dto.EventDate;
            ev.BackgroundImageUrl = dto.BackgroundImageUrl;
            ev.HallId = dto.HallId;

            await _context.SaveChangesAsync();
        }

        //public async Task ActivateEventAsync(int eventId)
        //{
        //    var ev = await _context.Events.FirstOrDefaultAsync(e => e.EventId == eventId);
        //    if (ev == null)
        //        throw new InvalidOperationException("Event not found");

        //    ev.IsActive = true;
        //    await _context.SaveChangesAsync();
        //}

        //public async Task DeactivateEventAsync(int eventId)
        //{
        //    var ev = await _context.Events.FirstOrDefaultAsync(e => e.EventId == eventId);
        //    if (ev == null)
        //        throw new InvalidOperationException("Event not found");

        //    ev.IsActive = false;
        //    await _context.SaveChangesAsync();
        //}

        public async Task<bool> IsEventActiveAsync(int eventId)
        {
            return await _context.Events
                .Where(e => e.EventId == eventId)
                .Select(e => e.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<List<EventTypeDto>> GetEventTypesWithAlbumsAsync()
        {
            return await _context.EventTypes
                .Include(x => x.ReadyAlbums)
                .Select(et => new EventTypeDto
                {
                    EventTypeId = et.EventTypeId,
                    EventTypeNameKey = et.EventTypeNameKey,
                    DefaultAlbumSCount = et.DefaultAlbumSCount,
                    ReadyAlbums = et.ReadyAlbums.Select(ra => new ReadyAlbumDto
                    {
                        ReadyAlbumId = ra.ReadyAlbumId,
                        AlbumName = ra.AlbumName,
                        IsDefault = ra.IsDefault,
                        Family = ra.Family,
                        Times = ra.Times,
                        EventTypeId = ra.EventTypeId
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<List<EventDto>?> GetEventsForHallAsync(int hallId)
        {
            var hallExists = await _context.Halls.AnyAsync(h => h.HallId == hallId);
            if (!hallExists)
                return null;

            var events = await _context.Events
                .Include(e => e.OwnerUser)
                .Include(e => e.Hall)
                .Include(e => e.EventType)
                .Include(e => e.MediaItems)
                .Include(e => e.GoldenBookEntries)
                .Include(e => e.Payments)
                .Where(e => e.HallId == hallId)
                .OrderByDescending(e => e.EventStartDate)
                .Select(e => new EventDto
                {
                    EventId = e.EventId,
                    EventName = e.EventName,
                    EventStartDate = e.EventStartDate,
                    EventEndDate = e.EventEndDate,
                    BackgroundImageUrl = e.BackgroundImageUrl,
                    OwnerUserId = e.OwnerUserId,
                    OwnerUserName = e.OwnerUser.Name,
                    HallId = e.HallId,
                    HallName = e.Hall.Name,
                    CreatedAt = e.CreatedAt,
                    EventTypeId = e.EventTypeId,
                    EventTypeName = e.EventType != null ? e.EventType.EventTypeNameKey : null,
                    DownloadStatus = e.DownloadStatus,
                    LastDownloadedAt = e.LastDownloadedAt,
                    SumPayments = (decimal)e.Payments.Sum(p => p.Sum),
                    GoldenBookEntriesCount = e.GoldenBookEntries.Count(),
                    ImagesCount = e.MediaItems.Count(m => m.MediaType == Models.Enums.MediaTypeEnum.Image),
                    VideoCount = e.MediaItems.Count(m => m.MediaType == Models.Enums.MediaTypeEnum.Video)
                })
                .ToListAsync();

            return events;
        }

        public async Task<List<EventDto>?> GetPastEventsForHallAsync(int hallId)
        {
            var hallExists = await _context.Halls.AnyAsync(h => h.HallId == hallId);
            if (!hallExists)
                return null;

            var events = await _context.Events
                .Include(e => e.OwnerUser)
                .Include(e => e.Hall)
                .Include(e => e.EventType)
                .Include(e => e.MediaItems)
                .Include(e => e.GoldenBookEntries)
                .Include(e => e.Payments)
                .Where(e => e.HallId == hallId && e.EventEndDate < DateTime.Now)
                .OrderByDescending(e => e.EventStartDate)
                .Select(e => new EventDto
                {
                    EventId = e.EventId,
                    EventName = e.EventName,
                    EventStartDate = e.EventStartDate,
                    EventEndDate = e.EventEndDate,
                    BackgroundImageUrl = e.BackgroundImageUrl,
                    OwnerUserId = e.OwnerUserId,
                    OwnerUserName = e.OwnerUser.Name,
                    HallId = e.HallId,
                    HallName = e.Hall.Name,
                    CreatedAt = e.CreatedAt,
                    EventTypeId = e.EventTypeId,
                    EventTypeName = e.EventType != null ? e.EventType.EventTypeNameKey : null,
                    DownloadStatus = e.DownloadStatus,
                    LastDownloadedAt = e.LastDownloadedAt,
                    SumPayments = (decimal)e.Payments.Sum(p => p.Sum),
                    GoldenBookEntriesCount = e.GoldenBookEntries.Count(),
                    ImagesCount = e.MediaItems.Count(m => m.MediaType == Models.Enums.MediaTypeEnum.Image),
                    VideoCount = e.MediaItems.Count(m => m.MediaType == Models.Enums.MediaTypeEnum.Video)
                })
                .ToListAsync();

            return events;
        }
    }
}
