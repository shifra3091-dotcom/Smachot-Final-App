using Microsoft.AspNetCore.Http;

namespace SmachotMemories.DTOs
{
    public class CreateHallDto
    {
        public string Name { get; set; } = null!;
        public string OwnerName { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? HallAddress { get; set; }
        public string? HallPhone { get; set; }
        public IFormFile? HallImage { get; set; }
        
        /// <summary>
        /// List of event type IDs (numbers) or event type names (text)
        /// Examples: [1, 2, 3] or ["Wedding", "BarMitzvah", "Brit"]
        /// </summary>
        public List<string> AllowedEventTypeIds { get; set; } = new List<string>();
    }
}
