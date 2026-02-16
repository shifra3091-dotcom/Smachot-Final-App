using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SmachotMemories.Models;

namespace SmachotMemories.Pages
{
    public class LoginModel : PageModel
    {
        [BindProperty]
        public string Email { get; set; }
        [BindProperty]
        public string Password { get; set; }

        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;

        public LoginModel(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
        }

        public async Task OnGet()
        {
            
        }

        public async Task<RedirectResult> OnPost()
        {
            if (!string.IsNullOrEmpty(Email) && !string.IsNullOrEmpty(Password))
            {
                var result = await userManager.FindByEmailAsync(Email);
                var loginResult = await signInManager.PasswordSignInAsync(result, Password, true, false);

                if (loginResult.Succeeded)
                    return Redirect("/UITexts");
                return Redirect("/Login");
            }
            return Redirect("/Login");

        }
    }
}
