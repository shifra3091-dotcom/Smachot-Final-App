using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using SmachotMemories.DTOs;
using SmachotMemories.DTOs.Auth;
using SmachotMemories.Models;
using SmachotMemories.Services.Interfaces;
using System.Web;
using SmachotMemories.Data;

namespace SmachotMemories.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _configuration;
        private readonly SmachotContext _context;

        public AuthService(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IHttpContextAccessor httpContextAccessor,
            IEmailSender emailSender,
            IConfiguration configuration,
            SmachotContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _httpContextAccessor = httpContextAccessor;
            _emailSender = emailSender;
            _configuration = configuration;
            _context = context;
        }

        public async Task<AuthResultDto> RegisterAsync(RegisterDto dto)
        {
            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "A user with this email already exists"
                };
            }

            var user = new User
            {
                UserName = dto.Email,
                Email = dto.Email,
                Name = dto.Name,
                Phone = dto.Phone ?? string.Empty,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (result.Succeeded)
            {
                await _signInManager.SignInAsync(user, isPersistent: false);

                return new AuthResultDto
                {
                    Success = true,
                    Message = "Registration successful",
                    User = await MapToUserInfoDtoAsync(user)
                };
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new AuthResultDto
            {
                Success = false,
                Message = $"Registration failed: {errors}"
            };
        }

        public async Task<AuthResultDto> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            var result = await _signInManager.PasswordSignInAsync(
                user,
                dto.Password,
                dto.RememberMe,
                lockoutOnFailure: true);

            if (result.Succeeded)
            {
                return new AuthResultDto
                {
                    Success = true,
                    Message = "Login successful",
                    User = await MapToUserInfoDtoAsync(user)
                };
            }

            if (result.IsLockedOut)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Account is locked. Please try again later."
                };
            }

            return new AuthResultDto
            {
                Success = false,
                Message = "Invalid email or password"
            };
        }

        public async Task LogoutAsync()
        {
            await _signInManager.SignOutAsync();
        }

        public async Task<UserInfoDto?> GetCurrentUserAsync()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
            {
                return null;
            }

            var user = await _userManager.GetUserAsync(httpContext.User);
            if (user == null)
            {
                return null;
            }

            return await MapToUserInfoDtoAsync(user);
        }

        public async Task<AuthResultDto> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                // Don't reveal that the user does not exist
                return new AuthResultDto
                {
                    Success = true,
                    Message = "If your email is registered, you will receive a password reset link."
                };
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = HttpUtility.UrlEncode(token);

            // Get the base URL from configuration or use a default
            var baseUrl = _configuration["AppSettings:ClientBaseUrl"] ?? "http://localhost:5174";
            var resetLink = $"{baseUrl}/reset-password?email={HttpUtility.UrlEncode(dto.Email)}&token={encodedToken}";

            var emailBody = $@"
                <h2>Password Reset Request</h2>
                <p>You have requested to reset your password.</p>
                <p>Click the link below to reset your password:</p>
                <p><a href='{resetLink}'>Reset Password</a></p>
                <p>If you did not request this, please ignore this email.</p>
                <p>This link will expire in 24 hours.</p>
            ";

            try
            {
                await _emailSender.SendEmailAsync(dto.Email, "Password Reset Request", emailBody);
            }
            catch (Exception)
            {
                // Log the error but don't reveal it to the user
            }

            return new AuthResultDto
            {
                Success = true,
                Message = "If your email is registered, you will receive a password reset link."
            };
        }

        public async Task<AuthResultDto> ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Invalid request"
                };
            }

            var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
            if (result.Succeeded)
            {
                return new AuthResultDto
                {
                    Success = true,
                    Message = "Password has been reset successfully"
                };
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new AuthResultDto
            {
                Success = false,
                Message = $"Failed to reset password: {errors}"
            };
        }

        public Task<bool> IsAuthenticatedAsync()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var isAuthenticated = httpContext?.User?.Identity?.IsAuthenticated ?? false;
            return Task.FromResult(isAuthenticated);
        }

        private async Task<UserInfoDto> MapToUserInfoDtoAsync(User user)
        {
            var events = await _context.Events
                .Include(e => e.Hall)
                .Include(e => e.EventType)
                .Where(e => e.OwnerUserId == user.Id)
                .OrderByDescending(e => e.EventStartDate)
                .Select(e => new EventDto
                {
                    EventId = e.EventId,
                    EventName = e.EventName,
                    EventStartDate = e.EventStartDate,
                    EventEndDate = e.EventEndDate,
                    BackgroundImageUrl = e.BackgroundImageUrl,
                    OwnerUserId = e.OwnerUserId,
                    OwnerUserName = user.Name,
                    HallId = e.HallId,
                    HallName = e.Hall.Name,
                    CreatedAt = e.CreatedAt,
                    EventTypeId = e.EventTypeId,
                    EventTypeName = e.EventType != null ? e.EventType.EventTypeNameKey : null,
                    DownloadStatus = e.DownloadStatus,
                    LastDownloadedAt = e.LastDownloadedAt,
                    SumPayments = 0,
                    GoldenBookEntriesCount = 0,
                    ImagesCount = 0,
                    VideoCount = 0
                })
                .ToListAsync();

            var halls = await _context.Halls
                .Include(h => h.OwnerUser)
                .Where(h => h.OwnerUserId == user.Id)
                .OrderByDescending(h => h.CreatedAt)
                .Select(h => new HallDto
                {
                    HallId = h.HallId,
                    Name = h.Name,
                    OwnerUserId = h.OwnerUserId,
                    OwnerUserName = h.OwnerUser.Name,
                    CreatedAt = h.CreatedAt,
                    QrCodeSource = h.QrCodeSource
                })
                .ToListAsync();

            return new UserInfoDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email!,
                Phone = user.Phone,
                Roles = user.Roles,
                CreatedAt = user.CreatedAt,
                Events = events,
                Halls = halls
            };
        }
    }
}
