using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using SmachotMemories.Data;
using SmachotMemories.DTOs;
using SmachotMemories.Models;
using SmachotMemories.Models.Enums;
using SmachotMemories.Services.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace SmachotMemories.Pages
{
    public class ExperimentsModel : PageModel
    {
        private readonly SmachotContext _context;
        private readonly UserManager<User> userManager;
        private readonly IMediaService _mediaService;
        private readonly IGoldenBookService _goldenBookService;


        public ExperimentsModel(SmachotContext context, UserManager<User> userManager, IMediaService mediaService, IGoldenBookService goldenBookService)
        {
            _context = context;
            this.userManager = userManager;
            _mediaService = mediaService;
            _goldenBookService = goldenBookService;
        }

        // User Input Model
        [BindProperty]
        public UserInputModel UserInput { get; set; } = new();

        // Hall Input Model
        [BindProperty]
        public HallInputModel HallInput { get; set; } = new();

        // Event Input Model
        [BindProperty]
        public EventInputModel EventInput { get; set; } = new();

        // Media Input Model
        [BindProperty]
        public MediaInputModel MediaInput { get; set; } = new();

        // GoldenBook Input Model
        [BindProperty]
        public GoldenBookInputModel GoldenBookInput { get; set; } = new();

        // Select Lists
        public SelectList UserRoles { get; set; } = null!;
        public SelectList Users { get; set; } = null!;
        public SelectList Halls { get; set; } = null!;
        public SelectList Events { get; set; } = null!;
        public SelectList Albums { get; set; } = null!;
        public SelectList MediaTypes { get; set; } = null!;

        public IEnumerable<UserRoleEnum> AvailableRoles => Enum.GetValues<UserRoleEnum>().Where(r => r != UserRoleEnum.None);

        // Messages
        [TempData]
        public string? SuccessMessage { get; set; }

        [TempData]
        public string? ErrorMessage { get; set; }

        public async Task OnGetAsync()
        {
            await LoadSelectListsAsync();
        }

        public async Task<IActionResult> OnPostCreateUserAsync()
        {
            // Only validate UserInput properties
            ModelState.Clear();
            if (!TryValidateModel(UserInput, nameof(UserInput)))
            {
                await LoadSelectListsAsync();
                ErrorMessage = "Please correct the user form errors.";
                return Page();
            }

            try
            {
                var user = new User
                {
                    Name = UserInput.UserName,
                    UserName = UserInput.Email,
                    Email = UserInput.Email,
                    Roles = UserInput.SelectedRoles.Aggregate(UserRoleEnum.None, (current, role) => current | role),
                    Phone = "05554584",
                    CreatedAt = DateTime.UtcNow,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(user, "p123");



                SuccessMessage = $"User '{user.UserName}' created successfully with ID: {user.Id}";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Error creating user: {ex.Message}";
            }

            return RedirectToPage();
        }

        public async Task<IActionResult> OnPostCreateHallAsync()
        {
            // Only validate HallInput properties
            ModelState.Clear();
            if (!TryValidateModel(HallInput, nameof(HallInput)))
            {
                await LoadSelectListsAsync();
                ErrorMessage = "Please correct the hall form errors.";
                return Page();
            }

            try
            {
                var hall = new Hall
                {
                    Name = HallInput.Name,
                    OwnerUserId = HallInput.OwnerUserId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Halls.Add(hall);
                await _context.SaveChangesAsync();

                SuccessMessage = $"Hall '{hall.Name}' created successfully with ID: {hall.HallId}";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Error creating hall: {ex.Message}";
            }

            return RedirectToPage();
        }

        public async Task<IActionResult> OnPostCreateEventAsync()
        {
            // Only validate EventInput properties
            ModelState.Clear();
            if (!TryValidateModel(EventInput, nameof(EventInput)))
            {
                await LoadSelectListsAsync();
                ErrorMessage = "Please correct the event form errors.";
                return Page();
            }

            try
            {
                var ev = new Event
                {
                    EventName = EventInput.EventName,
                    EventStartDate = DateTime.SpecifyKind(EventInput.EventStartDate, DateTimeKind.Utc),
                    EventEndDate = DateTime.SpecifyKind(EventInput.EventEndDate, DateTimeKind.Utc),
                    BackgroundImageUrl = EventInput.BackgroundImageUrl,
                    OwnerUserId = EventInput.OwnerUserId,
                    HallId = EventInput.HallId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Events.Add(ev);
                await _context.SaveChangesAsync();

                SuccessMessage = $"Event '{ev.EventName}' created successfully with ID: {ev.EventId}";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Error creating event: {ex.Message}";
            }

            return RedirectToPage();
        }

        public async Task<IActionResult> OnPostUploadMediaAsync()
        {
            // Only validate MediaInput properties
            ModelState.Clear();
            if (!TryValidateModel(MediaInput, nameof(MediaInput)))
            {
                await LoadSelectListsAsync();
                ErrorMessage = "Please correct the media form errors.";
                return Page();
            }

            if (MediaInput.File == null || MediaInput.File.Length == 0)
            {
                await LoadSelectListsAsync();
                ErrorMessage = "Please select a file to upload.";
                return Page();
            }

            try
            {
                var dto = new UploadMediaDto
                {
                    EventId = MediaInput.EventId,
                    AlbumIds = MediaInput.AlbumId.HasValue ? new List<int> { MediaInput.AlbumId.Value } : null,
                    MediaType = MediaInput.MediaType,
                    File = MediaInput.File,
                    IsPublic = MediaInput.IsPublic,
                    GuestName = MediaInput.GuestName,
                    DurationSeconds = MediaInput.DurationSeconds
                };

                var media = await _mediaService.UploadMediaAsync(dto);

                SuccessMessage = $"Media uploaded successfully with ID: {media.MediaId}. File: {media.FileUrl}";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Error uploading media: {ex.Message}";
            }

            return RedirectToPage();
        }

        public async Task<IActionResult> OnPostCreateGoldenBookEntryAsync()
        {
            // Only validate GoldenBookInput properties
            ModelState.Clear();
            if (!TryValidateModel(GoldenBookInput, nameof(GoldenBookInput)))
            {
                await LoadSelectListsAsync();
                ErrorMessage = "Please correct the golden book form errors.";
                return Page();
            }

            try
            {
                var dto = new AddGoldenBookEntryDto
                {
                    EventId = GoldenBookInput.EventId,
                    Content = GoldenBookInput.Content
                };

                await _goldenBookService.AddEntryAsync(dto);

                SuccessMessage = $"Golden Book entry created successfully for Event ID: {GoldenBookInput.EventId}";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Error creating golden book entry: {ex.Message}";
            }

            return RedirectToPage();
        }

        private async Task LoadSelectListsAsync()
        {
            UserRoles = new SelectList(
                Enum.GetValues<UserRoleEnum>()
                    .Where(e => e != UserRoleEnum.None)
                    .Select(e => new { Value = (int)e, Text = e.ToString() }),
                "Value",
                "Text"
            );

            var users = await _context.Users
                .Select(u => new { u.Id, u.Name })
                .ToListAsync();
            Users = new SelectList(users, "Id", "Name");

            var halls = await _context.Halls
                .Select(h => new { h.HallId, h.Name })
                .ToListAsync();
            Halls = new SelectList(halls, "HallId", "Name");

            var events = await _context.Events
                .Select(e => new { e.EventId, e.EventName })
                .ToListAsync();
            Events = new SelectList(events, "EventId", "EventName");

            var albums = await _context.Albums
                .Include(a => a.Event)
                .Select(a => new { a.AlbumId, DisplayName = $"{a.Name} ({a.Event.EventName})" })
                .ToListAsync();
            Albums = new SelectList(albums, "AlbumId", "DisplayName");

            MediaTypes = new SelectList(
                Enum.GetValues<MediaTypeEnum>().Select(e => new { Value = (int)e, Text = e.ToString() }),
                "Value",
                "Text"
            );
        }
    }

    public class UserInputModel
    {
        [Required]
        [StringLength(100)]
        public string UserName { get; set; } = string.Empty;

        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        public List<UserRoleEnum> SelectedRoles { get; set; } = new();
    }

    public class HallInputModel
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Display(Name = "Owner User")]
        public int OwnerUserId { get; set; }
    }

    public class EventInputModel
    {
        [Required]
        [StringLength(200)]
        [Display(Name = "Event Name")]
        public string EventName { get; set; } = string.Empty;

        [Required]
        [Display(Name = "Start Date")]
        public DateTime EventStartDate { get; set; } = DateTime.Now;

        [Required]
        [Display(Name = "End Date")]
        public DateTime EventEndDate { get; set; } = DateTime.Now.AddDays(1);

        [Display(Name = "Background Image URL")]
        public string? BackgroundImageUrl { get; set; }

        [Required]
        [Display(Name = "Owner User")]
        public int OwnerUserId { get; set; }

        [Required]
        [Display(Name = "Hall")]
        public int HallId { get; set; }
    }

    public class MediaInputModel
    {
        [Required]
        [Display(Name = "Event")]
        public int EventId { get; set; }

        [Display(Name = "Album (Optional)")]
        public int? AlbumId { get; set; }

        [Required]
        [Display(Name = "Media Type")]
        public MediaTypeEnum MediaType { get; set; } = MediaTypeEnum.Image;

        [Required]
        [Display(Name = "File")]
        public IFormFile File { get; set; } = null!;

        [Display(Name = "Public")]
        public bool IsPublic { get; set; } = true;

        [Display(Name = "Guest Name")]
        public string? GuestName { get; set; }

        [Display(Name = "Duration (seconds)")]
        public int? DurationSeconds { get; set; }
    }

    public class GoldenBookInputModel
    {
        [Required]
        [Display(Name = "Event")]
        public int EventId { get; set; }

        [Required]
        [StringLength(2000)]
        [Display(Name = "Content")]
        public string Content { get; set; } = string.Empty;
    }
}
