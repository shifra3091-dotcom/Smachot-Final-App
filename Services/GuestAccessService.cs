using Microsoft.EntityFrameworkCore;
using SmachotMemories.Data;
using SmachotMemories.Models;
using SmachotMemories.Services.Interfaces;

namespace SmachotMemories.Services
{
    public class GuestAccessService : IGuestAccessService
    {
        private readonly SmachotContext _context;

        public GuestAccessService(SmachotContext db)
        {
            _context = db;
        }

        public async Task RegisterSubmissionAsync(int eventId, string deviceId)
        {
            if (string.IsNullOrWhiteSpace(deviceId))
                throw new ArgumentException("DeviceId is required");

            var existing = await _context.GuestSubmissions
                .FirstOrDefaultAsync(x => x.EventId == eventId && x.DeviceId == deviceId);

            if (existing != null)
            {
                if (!existing.HasSubmitted)
                {
                    existing.HasSubmitted = true;
                    await _context.SaveChangesAsync();
                }
                return;
            }

            var submission = new GuestSubmission
            {
                EventId = eventId,
                DeviceId = deviceId,
                HasSubmitted = true,
                CreatedAt = DateTime.Now
            };

            _context.GuestSubmissions.Add(submission);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> HasGalleryAccessAsync(int eventId, string deviceId)
        {
            if (string.IsNullOrWhiteSpace(deviceId))
                return false;

            return await _context.GuestSubmissions
                .AnyAsync(x =>
                    x.EventId == eventId &&
                    x.DeviceId == deviceId &&
                    x.HasSubmitted);
        }
    }
}
