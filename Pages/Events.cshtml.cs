using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;
using System.Linq;
using SmachotMemories.Data;
using SmachotMemories.Models;

namespace SmachotMemories.Pages
{
    public class EventsModel : PageModel
    {
        private readonly SmachotContext _context;
        [BindProperty(SupportsGet =true)]
        public int hallId { get; set; }
        [BindProperty(SupportsGet =true)]
        public int EventId { get; set; }
        public EventsModel(SmachotContext context)
        {
            _context = context;
        }

        public List<Event> Events { get; set; }

        public void OnGet(int? HallId)
        {
            if (HallId.HasValue)
            {
                // Log HallId for debugging
                Console.WriteLine($"Received HallId: {HallId.Value}");

                Events = _context.Events
                    .Where(e => e.HallId == HallId.Value) // Filter events by HallId
                    .ToList();
            }
            else
            {
                Console.WriteLine("No HallId received");
                Events = _context.Events.ToList();
            }
        }
    }
}
