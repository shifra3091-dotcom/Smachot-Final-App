using Microsoft.EntityFrameworkCore;
using SmachotMemories.Data;
using SmachotMemories.Models;
using SmachotMemories.Services.Interfaces;

namespace SmachotMemories.Services
{
    public class AlbumService : IAlbumService
    {
        private readonly SmachotContext _context;

        public AlbumService(SmachotContext db)
        {
            _context = db;
        }

        public async Task<Album> CreateAlbumAsync(int eventId, string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Album name is required");

            var eventExists = await _context.Events.AnyAsync(e => e.EventId == eventId);
            if (!eventExists)
                throw new InvalidOperationException("Event not found");

            var album = new Album
            {
                EventId = eventId,
                Name = name,
                CreatedAt = DateTime.Now
            };

            _context.Albums.Add(album);
            await _context.SaveChangesAsync();

            return album;
        }

        public async Task<List<Album>> GetAlbumsForEventAsync(int eventId)
        {
            return await _context.Albums
                .Include(a => a.MediaItems)
                .Where(a => a.EventId == eventId)
                .OrderBy(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task RenameAlbumAsync(int albumId, string newName)
        {
            if (string.IsNullOrWhiteSpace(newName))
                throw new ArgumentException("Album name is required");

            var album = await _context.Albums.FirstOrDefaultAsync(a => a.AlbumId == albumId);
            if (album == null)
                throw new InvalidOperationException("Album not found");

            album.Name = newName;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAlbumAsync(int albumId)
        {
            var album = await _context.Albums
                .Include(a => a.MediaItems)
                .FirstOrDefaultAsync(a => a.AlbumId == albumId);

            if (album == null)
                throw new InvalidOperationException("Album not found");

            if (album.MediaItems.Any())
                throw new InvalidOperationException("Cannot delete album with media");

            _context.Albums.Remove(album);
            await _context.SaveChangesAsync();
        }
    }

}
