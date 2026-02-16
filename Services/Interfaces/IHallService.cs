using SmachotMemories.DTOs;

namespace SmachotMemories.Services.Interfaces
{
    public interface IHallService
    {
        Task<int> CreateHallAsync(CreateHallDto dto);
        Task UpdateAllowedEventTypesAsync(int hallId, List<int> eventTypeIds);
        Task UpdateAllowedEventTypesByNamesAsync(int hallId, List<string> eventTypeNames);
    }
}
