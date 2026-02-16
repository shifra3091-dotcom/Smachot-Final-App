using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SmachotMemories.Data;

namespace SmachotMemories.Pages
{
    public class EventAtHallModel : PageModel
    {
        [BindProperty(SupportsGet =true)]
        public int HallId { get; set; }
        private readonly SmachotContext _context;

        public string EventName { get; set; }
        public EventAtHallModel(SmachotContext context)
        {
            this._context = context;
        }

        public RedirectResult OnGet()
        {
            var EventHall = _context.Halls.Include(x=>x.Events).First(x=>x.HallId == HallId).Events.FirstOrDefault();
            EventName = EventHall?.EventName ?? "No Events In This Hall";

            //active event
            var eventsHall = _context.Halls.Include(x => x.Events).First(x => x.HallId == HallId).Events;
            var activeEvent = eventsHall.FirstOrDefault(x => x.IsActive);
            if(activeEvent!= null)//יש אירוע פעיל
                return Redirect($"http://localhost:5176/guest-options?eventId={activeEvent.EventId}&hallId={HallId}");
            else//אין אירוע פעילל
                //להוסיף בצד לקוח אין אירועים פעילים כרגע
                return Redirect($"http://localhost:5176/guest-options?eventId=0&hallId={HallId}");

        }
    }
}
