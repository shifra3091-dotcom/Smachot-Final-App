using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SmachotMemories.Models;
using SmachotMemories.Models.Enums;

namespace SmachotMemories.Pages
{
    public class UserDetailsModel : PageModel
    {
        private readonly UserManager<User> _userManager;

        public UserDetailsModel(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        [BindProperty(SupportsGet = true)]
        public int OwnerUserId { get; set; }

        public User? CurrentUser { get; set; }

        [BindProperty]
        public string? Name { get; set; }

        [BindProperty]
        public string? Phone { get; set; }

        [BindProperty]
        public List<UserRoleEnum> SelectedRoles { get; set; } = new();

        [BindProperty]
        public string? NewPassword { get; set; }

        public string? SuccessMessage { get; set; }
        public string? ErrorMessage { get; set; }

        public IEnumerable<UserRoleEnum> AvailableRoles => Enum.GetValues<UserRoleEnum>().Where(r => r != UserRoleEnum.None);

        public async Task<IActionResult> OnGetAsync()
        {
            CurrentUser = await _userManager.FindByIdAsync(OwnerUserId.ToString());
            if (CurrentUser == null)
            {
                return NotFound();
            }

            Name = CurrentUser.Name;
            Phone = CurrentUser.Phone;
            SelectedRoles = GetRolesFromFlags(CurrentUser.Roles);

            return Page();
        }

        public async Task<IActionResult> OnPostUpdateProfileAsync()
        {
            CurrentUser = await _userManager.FindByIdAsync(OwnerUserId.ToString());
            if (CurrentUser == null)
            {
                return NotFound();
            }

            CurrentUser.Name = Name ?? string.Empty;
            CurrentUser.Phone = Phone ?? string.Empty;
            CurrentUser.Roles = CombineRoles(SelectedRoles);

            // Update the security stamp before saving
            await _userManager.UpdateSecurityStampAsync(CurrentUser);

            var result = await _userManager.UpdateAsync(CurrentUser);
            if (result.Succeeded)
            {
                SuccessMessage = "Profile updated successfully!";
            }
            else
            {
                ErrorMessage = string.Join(", ", result.Errors.Select(e => e.Description));
            }

            return Page();
        }

        public async Task<IActionResult> OnPostChangePasswordAsync()
        {
            CurrentUser = await _userManager.FindByIdAsync(OwnerUserId.ToString());
            if (CurrentUser == null)
            {
                return NotFound();
            }

            // Reload profile fields
            Name = CurrentUser.Name;
            Phone = CurrentUser.Phone;
            SelectedRoles = GetRolesFromFlags(CurrentUser.Roles);

            if (string.IsNullOrWhiteSpace(NewPassword))
            {
                ErrorMessage = "Password cannot be empty.";
                return Page();
            }

            var u = await _userManager.FindByEmailAsync(CurrentUser.Email!);
            if (u == null)
            {
                ErrorMessage = "User not found.";
                return Page();
            }

            var tk = await _userManager.GeneratePasswordResetTokenAsync(u);
            var result = await _userManager.ResetPasswordAsync(u, tk, NewPassword);

            if (result.Succeeded)
            {
                SuccessMessage = "Password changed successfully!";
                NewPassword = null;
            }
            else
            {
                ErrorMessage = string.Join(", ", result.Errors.Select(e => e.Description));
            }

            return Page();
        }

        private static List<UserRoleEnum> GetRolesFromFlags(UserRoleEnum roles)
        {
            return Enum.GetValues<UserRoleEnum>()
                .Where(r => r != UserRoleEnum.None && (roles & r) == r)
                .ToList();
        }

        private static UserRoleEnum CombineRoles(List<UserRoleEnum> roles)
        {
            return roles.Aggregate(UserRoleEnum.None, (current, role) => current | role);
        }
    }
}
