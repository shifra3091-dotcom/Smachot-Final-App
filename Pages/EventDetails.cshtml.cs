using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SmachotMemories.Data;

namespace SmachotMemories.Pages
{
    public class EventDetailsModel : PageModel
    {
        private readonly SmachotContext _context;

        public EventDetailsModel(SmachotContext context)
        {
            _context = context;
        }

        [BindProperty(SupportsGet = true)]
        public int EventId { get; set; }

        public string? EventName { get; set; }

        public async Task OnGetAsync()
        {
            var eventEntity = await _context.Events
                .Where(e => e.EventId == EventId)
                .Select(e => new { e.EventName })
                .FirstOrDefaultAsync();

            EventName = eventEntity?.EventName ?? "Event";
        }
    }
}
