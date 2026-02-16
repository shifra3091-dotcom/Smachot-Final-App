using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SmachotMemories.Data;
using SmachotMemories.Models;
using SmachotMemories.Services.Interfaces;

namespace SmachotMemories.Pages
{
    public class HallDetailsModel : PageModel
    {
        private readonly SmachotContext _context;
        private readonly IQRCodeService _qrCodeService;

        public HallDetailsModel(SmachotContext context, IQRCodeService qrCodeService)
        {
            _context = context;
            _qrCodeService = qrCodeService;
        }

        [BindProperty(SupportsGet = true)]
        public int HallId { get; set; }

        public Hall? CurrentHall { get; set; }

        [BindProperty]
        public string? Name { get; set; }

        [BindProperty]
        public int OwnerUserId { get; set; }

        public List<User> AvailableOwners { get; set; } = new();

        public string? SuccessMessage { get; set; }
        public string? ErrorMessage { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            CurrentHall = await _context.Halls
                .Include(h => h.OwnerUser)
                .Include(h => h.Events)
                .Include(h => h.Feedbacks)
                .FirstOrDefaultAsync(h => h.HallId == HallId);

            if (CurrentHall == null)
            {
                return NotFound();
            }

            Name = CurrentHall.Name;
            OwnerUserId = CurrentHall.OwnerUserId;

            await LoadAvailableOwnersAsync();

            return Page();
        }

        public async Task<IActionResult> OnPostUpdateHallAsync()
        {
            CurrentHall = await _context.Halls
                .Include(h => h.OwnerUser)
                .Include(h => h.Events)
                .Include(h => h.Feedbacks)
                .FirstOrDefaultAsync(h => h.HallId == HallId);

            if (CurrentHall == null)
            {
                return NotFound();
            }

            await LoadAvailableOwnersAsync();

            if (string.IsNullOrWhiteSpace(Name))
            {
                ErrorMessage = "Hall name cannot be empty.";
                return Page();
            }

            CurrentHall.Name = Name;
            CurrentHall.OwnerUserId = OwnerUserId;

            try
            {
                await _context.SaveChangesAsync();
                SuccessMessage = "Hall updated successfully!";

                // Reload the hall with updated owner
                CurrentHall = await _context.Halls
                    .Include(h => h.OwnerUser)
                    .Include(h => h.Events)
                    .Include(h => h.Feedbacks)
                    .FirstOrDefaultAsync(h => h.HallId == HallId);
            }
            catch (DbUpdateException ex)
            {
                ErrorMessage = "Error updating hall: " + ex.Message;
            }

            return Page();
        }

        public async Task<IActionResult> OnPostGenerateQrCodeAsync()
        {
            CurrentHall = await _context.Halls
                .Include(h => h.OwnerUser)
                .Include(h => h.Events)
                .Include(h => h.Feedbacks)
                .FirstOrDefaultAsync(h => h.HallId == HallId);

            if (CurrentHall == null)
            {
                return NotFound();
            }

            await LoadAvailableOwnersAsync();
            Name = CurrentHall.Name;
            OwnerUserId = CurrentHall.OwnerUserId;

            try
            {
                // Generate the URL for the hall
                var hallUrl = _qrCodeService.GenerateHallUrl(HallId);

                // Generate the QR code as byte array
                var qrCodeBytes = _qrCodeService.GenerateQRCode(hallUrl);

                // Convert to base64 data URL
                var base64QrCode = $"data:image/png;base64,{Convert.ToBase64String(qrCodeBytes)}";

                // Save to database
                CurrentHall.QrCodeSource = base64QrCode;
                await _context.SaveChangesAsync();

                SuccessMessage = "QR Code generated successfully!";
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error generating QR Code: " + ex.Message;
            }

            return Page();
        }

        private async Task LoadAvailableOwnersAsync()
        {
            AvailableOwners = await _context.Users.ToListAsync();
        }
    }
}
