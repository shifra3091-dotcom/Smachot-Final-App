using SmachotMemories.Models;
using SmachotMemories.Models.Enums;

namespace SmachotMemories.DTOs.Auth
{
    public class UserInfoDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public UserRoleEnum Roles { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<EventDto> ? Events { get; set; } = new List<EventDto>();
        public ICollection<HallDto> ? Halls { get; set; } = new List<HallDto>();
    }
}
