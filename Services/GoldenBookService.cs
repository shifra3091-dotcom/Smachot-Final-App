using Microsoft.EntityFrameworkCore;
using SmachotMemories.Data;
using SmachotMemories.DTOs;
using SmachotMemories.Models;
using SmachotMemories.Services.Interfaces;

namespace SmachotMemories.Services
{
    public class GoldenBookService : IGoldenBookService
    {
        private readonly SmachotContext _context;

        public GoldenBookService(SmachotContext db)
        {
            _context = db;
        }

        public async Task AddEntryAsync(AddGoldenBookEntryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
                throw new ArgumentException("Content is required");

            // בדיקה: אירוע קיים ופעיל
            var ev = await _context.Events
                .FirstOrDefaultAsync(e => e.EventId == dto.EventId);

            if (ev == null)
                throw new InvalidOperationException("Event not found");

            //if (!ev.IsActive) לבדוק שזה לא מנהל המערכת שהו אתמיד יכול
            //    throw new InvalidOperationException("Event is not active");

            var entry = new GoldenBookEntry
            {
                EventId = dto.EventId,
                SenderName = dto.SenderName?.Trim(),
                Content = dto.Content.Trim(),
                CreatedAt = DateTime.Now
            };

            _context.GoldenBookEntries.Add(entry);
            await _context.SaveChangesAsync();
        }

        public async Task<List<GoldenBookEntry>> GetEntriesForEventAsync(int eventId)
        {
            return await _context.GoldenBookEntries
                .Where(x => x.EventId == eventId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> DeleteEntryAsync(int entryId)
        {
            var entry = await _context.GoldenBookEntries.FindAsync(entryId);
            if (entry == null)
                return false;

            _context.GoldenBookEntries.Remove(entry);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
