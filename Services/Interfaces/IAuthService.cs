using SmachotMemories.DTOs.Auth;
using SmachotMemories.Models;

namespace SmachotMemories.Services.Interfaces
{
    public interface IAuthService
    {
        /// <summary>
        /// Registers a new user.
        /// </summary>
        Task<AuthResultDto> RegisterAsync(RegisterDto dto);

        /// <summary>
        /// Authenticates a user with email and password.
        /// </summary>
        Task<AuthResultDto> LoginAsync(LoginDto dto);

        /// <summary>
        /// Signs out the current user.
        /// </summary>
        Task LogoutAsync();

        /// <summary>
        /// Gets the currently logged in user, or null if not authenticated.
        /// </summary>
        Task<UserInfoDto?> GetCurrentUserAsync();

        /// <summary>
        /// Initiates the forgot password flow by sending a reset email.
        /// </summary>
        Task<AuthResultDto> ForgotPasswordAsync(ForgotPasswordDto dto);

        /// <summary>
        /// Resets the user's password using the token from the forgot password email.
        /// </summary>
        Task<AuthResultDto> ResetPasswordAsync(ResetPasswordDto dto);

        /// <summary>
        /// Checks if a user is currently authenticated.
        /// </summary>
        Task<bool> IsAuthenticatedAsync();
    }
}
