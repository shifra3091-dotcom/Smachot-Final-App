using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SmachotMemories.Data;
using SmachotMemories.DTOs;
using SmachotMemories.Models.Enums;
using SmachotMemories.Services.Interfaces;

namespace SmachotMemories.Pages
{
    public class HallFeedbackModel : PageModel
    {
        private readonly IHallFeedbackService _hallFeedbackService;
        private readonly SmachotContext _context;

        public HallFeedbackModel(IHallFeedbackService hallFeedbackService, SmachotContext context)
        {
            _hallFeedbackService = hallFeedbackService;
            _context = context;
        }

        [BindProperty(SupportsGet = true)]
        public int HallId { get; set; }

        public string HallName { get; set; } = string.Empty;
        public List<HallFeedbackDto> Feedbacks { get; set; } = new();

        public int TotalFeedback => Feedbacks.Count;
        public int WaiterFeedbackCount => Feedbacks.Count(f => f.Category == FeedbackCategoryEnum.Waiter);
        public int FoodFeedbackCount => Feedbacks.Count(f => f.Category == FeedbackCategoryEnum.Food);
        public int DesignFeedbackCount => Feedbacks.Count(f => f.Category == FeedbackCategoryEnum.Design);
        public int FreeFeedbackCount => Feedbacks.Count(f => f.Category == FeedbackCategoryEnum.Free);

        public async Task<IActionResult> OnGetAsync()
        {
            var hall = await _context.Halls.FirstOrDefaultAsync(h => h.HallId == HallId);
            if (hall == null)
            {
                return NotFound();
            }

            HallName = hall.Name;
            var feedbacks = await _hallFeedbackService.GetFeedbacksForHallAsync(HallId);
            
            // Map to DTO to avoid circular reference issues
            Feedbacks = feedbacks.Select(f => new HallFeedbackDto
            {
                HallFeedbackId = f.HallFeedbackId,
                HallId = f.HallId,
                EventId = f.EventId,
                Category = f.Category,
                TableNumber = f.TableNumber,
                Content = f.Content,
                CreatedAt = f.CreatedAt
            }).ToList();

            return Page();
        }
    }
}
