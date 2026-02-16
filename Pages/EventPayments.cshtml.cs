using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace SmachotMemories.Pages
{
    public class EventPaymentsModel : PageModel
    {
        [BindProperty(SupportsGet = true)]
        public int EventId { get; set; }
        public void OnGet()
        {
        }
    }
}
