using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmachotMemories.Data;
using SmachotMemories.DTOs;
using SmachotMemories.Models;
using SmachotMemories.Models.Enums;
using SmachotMemories.Services.Interfaces;

namespace SmachotMemories.Services
{
    public class HallService : IHallService
    {
        private readonly SmachotContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IQRCodeService _qrCodeService;
        private readonly IWebHostEnvironment _env;

        public HallService(SmachotContext context, UserManager<User> userManager, IQRCodeService qrCodeService, IWebHostEnvironment env)
        {
            _context = context;
            _userManager = userManager;
            _qrCodeService = qrCodeService;
            _env = env;
        }

        public async Task<int> CreateHallAsync(CreateHallDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("Hall name is required");

            if (string.IsNullOrWhiteSpace(dto.OwnerName))
                throw new ArgumentException("Owner name is required");

            if (string.IsNullOrWhiteSpace(dto.Phone))
                throw new ArgumentException("Phone is required");

            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new ArgumentException("Email is required");

            if (string.IsNullOrWhiteSpace(dto.Password))
                throw new ArgumentException("Password is required");

            User user;
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            
            if (existingUser != null)
            {
                user = existingUser;
                
                if (!user.HasRole(UserRoleEnum.HallOwner))
                {
                    user.AddRole(UserRoleEnum.HallOwner);
                    await _userManager.UpdateAsync(user);
                }
            }
            else
            {
                user = new User
                {
                    UserName = dto.Email,
                    Email = dto.Email,
                    Name = dto.OwnerName,
                    Phone = dto.Phone,
                    Roles = UserRoleEnum.HallOwner,
                    CreatedAt = DateTime.Now,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(user, dto.Password);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Failed to create user: {errors}");
                }
            }

            string? imageUrl = null;
            if (dto.HallImage != null && dto.HallImage.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "halls");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(dto.HallImage.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.HallImage.CopyToAsync(stream);
                }

                imageUrl = $"uploads/halls/{fileName}";
            }

            var qrCodeData = $"HallId:{user.Id}";
            var qrCodeBytes = _qrCodeService.GenerateQRCode(qrCodeData);
            var qrCodeBase64 = Convert.ToBase64String(qrCodeBytes);

            var hall = new Hall
            {
                Name = dto.Name,
                Address = dto.HallAddress,
                Phone = dto.HallPhone,
                ImageUrl = imageUrl,
                OwnerUserId = user.Id,
                QrCodeSource = qrCodeBase64,
                CreatedAt = DateTime.Now,
                AllowedEventTypes = new List<EventType>()
            };

            // ? ????? EventType ??? ??? ?? ?????? ????????
            if (dto.AllowedEventTypeIds != null && dto.AllowedEventTypeIds.Any())
            {
                foreach (var eventTypeName in dto.AllowedEventTypeIds)
                {
                    if (string.IsNullOrWhiteSpace(eventTypeName))
                        continue;

                    // ????? EventType ??? ???? ????? ???
                    var newEventType = new EventType
                    {
                        EventTypeNameKey = eventTypeName.Trim(),
                        DefaultAlbumSCount = GetDefaultAlbumCount(eventTypeName),
                        Hall = hall
                    };

                    hall.AllowedEventTypes.Add(newEventType);
                }
            }

            _context.Halls.Add(hall);
            await _context.SaveChangesAsync();

            return hall.HallId;
        }

        // Helper method to get default album count based on event type name
        private int GetDefaultAlbumCount(string eventTypeName)
        {
            return eventTypeName.ToLower() switch
            {
                "wedding" or "?????" => 5,
                "barmitzvah" or "?? ?????" or "?? ?????" => 4,
                "brit" or "????" => 3,
                _ => 3 // default
            };
        }

        public async Task UpdateAllowedEventTypesAsync(int hallId, List<int> eventTypeIds)
        {
            var hall = await _context.Halls
                .Include(h => h.AllowedEventTypes)
                .FirstOrDefaultAsync(h => h.HallId == hallId);

            if (hall == null)
                throw new InvalidOperationException("Hall not found");

            // ????? EventTypes ?????? ?? ?????
            if (hall.AllowedEventTypes.Any())
            {
                _context.EventTypes.RemoveRange(hall.AllowedEventTypes);
            }

            hall.AllowedEventTypes.Clear();

            // ????? EventTypes ?????
            if (eventTypeIds != null && eventTypeIds.Any())
            {
                // ??? ?? ????? ?? EventTypes ??? IDs (???? EventTypes ???????? ?? ??)
                var globalEventTypes = await _context.EventTypes
                    .Where(et => et.HallId == null && eventTypeIds.Contains(et.EventTypeId))
                    .ToListAsync();

                foreach (var globalEventType in globalEventTypes)
                {
                    // ????? ???? ??? ???? ?????
                    var newEventType = new EventType
                    {
                        EventTypeNameKey = globalEventType.EventTypeNameKey,
                        DefaultAlbumSCount = globalEventType.DefaultAlbumSCount,
                        Hall = hall
                    };
                    
                    hall.AllowedEventTypes.Add(newEventType);
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task UpdateAllowedEventTypesByNamesAsync(int hallId, List<string> eventTypeNames)
        {
            var hall = await _context.Halls
                .Include(h => h.AllowedEventTypes)
                .FirstOrDefaultAsync(h => h.HallId == hallId);

            if (hall == null)
                throw new InvalidOperationException("Hall not found");

            // ????? EventTypes ??????
            if (hall.AllowedEventTypes.Any())
            {
                _context.EventTypes.RemoveRange(hall.AllowedEventTypes);
            }

            hall.AllowedEventTypes.Clear();

            // ????? EventTypes ????? ??????
            if (eventTypeNames != null && eventTypeNames.Any())
            {
                foreach (var name in eventTypeNames)
                {
                    if (string.IsNullOrWhiteSpace(name))
                        continue;

                    var newEventType = new EventType
                    {
                        EventTypeNameKey = name.Trim(),
                        DefaultAlbumSCount = GetDefaultAlbumCount(name),
                        Hall = hall
                    };

                    hall.AllowedEventTypes.Add(newEventType);
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
