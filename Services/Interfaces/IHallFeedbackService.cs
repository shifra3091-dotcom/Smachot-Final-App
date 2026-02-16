using SmachotMemories.DTOs;
using SmachotMemories.Models;
using SmachotMemories.Models.Enums;

namespace SmachotMemories.Services.Interfaces
{
    public interface IHallFeedbackService
    {
        Task AddFeedbackAsync(AddHallFeedbackDto dto);

        Task<List<HallFeedback>> GetFeedbacksForEventAsync(int eventId);

        Task<List<HallFeedback>> GetFeedbacksForHallAsync(int hallId);

        Task<List<FeedbackCategoryEnum>> GetCategoriesForEventAsync(int eventId);
    }
}
