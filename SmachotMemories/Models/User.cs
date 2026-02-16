using Microsoft.AspNetCore.Identity;
using SmachotMemories.Models.Enums;

namespace SmachotMemories.Models
{
    public class User : IdentityUser<int>
    {
        public string Name { get; set; }
        public string Phone { get; set; }
        public UserRoleEnum Roles { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<Event> Events { get; set; } = new List<Event>();
        public ICollection<Hall> Halls { get; set; } = new List<Hall>();

        /// <summary>
        /// Checks if the user has the specified role.
        /// </summary>
        public bool HasRole(UserRoleEnum role) => (Roles & role) == role;

        /// <summary>
        /// Adds a role to the user.
        /// </summary>
        public void AddRole(UserRoleEnum role) => Roles |= role;

        /// <summary>
        /// Removes a role from the user.
        /// </summary>
        public void RemoveRole(UserRoleEnum role) => Roles &= ~role;
    }
    public class UserRole : IdentityRole<int>
    {

    }
}
