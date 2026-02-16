using SmachotMemories.DTOs;
using SmachotMemories.Models;

namespace SmachotMemories.Services.Interfaces
{
    public interface IGoldenBookService
    {
        Task AddEntryAsync(AddGoldenBookEntryDto dto);
        Task<List<GoldenBookEntry>> GetEntriesForEventAsync(int eventId);
        Task<bool> DeleteEntryAsync(int entryId);
    }
}
