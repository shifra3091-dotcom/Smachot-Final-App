using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace SmachotMemories.Pages
{
    public class TryModel : PageModel
    {
        [BindProperty]
        public string Name { get; set; }
        public void OnGet()
        {
        }
        public void OnPost()
        {
            var dd = Name;
        }
        public void OnPostNewFunc()
        {
            var dd = Name;
        }
    }
}
