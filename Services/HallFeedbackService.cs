using Microsoft.EntityFrameworkCore;
using SmachotMemories.Data;
using SmachotMemories.DTOs;
using SmachotMemories.Models;
using SmachotMemories.Services.Interfaces;

namespace SmachotMemories.Services
{
    public class HallFeedbackService : IHallFeedbackService
    {
        private readonly SmachotContext _context;

        public HallFeedbackService(SmachotContext db)
        {
            _context = db;
        }

        public async Task AddFeedbackAsync(AddHallFeedbackDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
                throw new ArgumentException("Content is required");

            var ev = await _context.Events
                .FirstOrDefaultAsync(e => e.EventId == dto.EventId);

            if (ev == null)
                throw new InvalidOperationException("Event not found");

            if (!ev.IsActive)
                throw new InvalidOperationException("Event is not active");

            var hallExists = await _context.Halls
                .AnyAsync(h => h.HallId == dto.HallId);

            if (!hallExists)
                throw new InvalidOperationException("Hall not found");

            var feedback = new HallFeedback
            {
                EventId = dto.EventId,
                HallId = dto.HallId,
                Category = dto.Category,
                TableNumber = dto.TableNumber,
                Content = dto.Content.Trim(),
                Rating = dto.Rating,
                CreatedAt = DateTime.Now
            };

            _context.HallFeedbacks.Add(feedback);
            await _context.SaveChangesAsync();
        }

        public async Task<List<HallFeedback>> GetFeedbacksForEventAsync(int eventId)
        {
            return await _context.HallFeedbacks
                .Where(f => f.EventId == eventId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<HallFeedback>> GetFeedbacksForHallAsync(int hallId)
        {
            return await _context.HallFeedbacks
                .Where(f => f.HallId == hallId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Models.Enums.FeedbackCategoryEnum>> GetCategoriesForEventAsync(int eventId)
        {
            var categories = await _context.HallFeedbacks
                .Where(f => f.EventId == eventId)
                .Select(f => f.Category)
                .Distinct()
                .ToListAsync();

            return categories;
        }
    }
}
