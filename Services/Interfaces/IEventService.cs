using Microsoft.AspNetCore.Mvc;
using SmachotMemories.DTOs;
using SmachotMemories.Models;

namespace SmachotMemories.Services.Interfaces
{
    public interface IEventService
    {
        Task<Event> CreateEventAsync(int ownerUserId, CreateEventDto dto);
        Task<Event> CreateEventWithAlbumsAsync(int ownerUserId, CreateEventDto dto, List<string> albums, [FromForm] IFormFile? eventImage);
        Task<Event> UpdateEventWithAlbumsAsync(int eventId, CreateEventDto dto, List<string> albums, IFormFile? eventImage);
        Task<Event?> GetEventByIdAsync(int eventId);
        Task<List<Event>> GetAllEventsAsync();
        Task<List<EventDto>> GetEventsForUserAsync(int ownerUserId);
        Task UpdateEventAsync(int eventId, UpdateEventDto dto);
        //Task ActivateEventAsync(int eventId);
        //Task DeactivateEventAsync(int eventId);
        Task<bool> IsEventActiveAsync(int eventId);
        Task<List<EventTypeDto>> GetEventTypesWithAlbumsAsync();
        Task<List<EventDto>?> GetEventsForHallAsync(int hallId);
        Task<List<EventDto>?> GetPastEventsForHallAsync(int hallId);
    }
}
