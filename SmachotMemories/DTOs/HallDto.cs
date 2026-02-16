using SmachotMemories.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmachotMemories.DTOs
{
    public class HallDto
    {
        public int HallId { get; set; }
        public string Name { get; set; } = null!;

        public int OwnerUserId { get; set; }
        public string OwnerUserName { get; set; }

        public DateTime CreatedAt { get; set; }
        public string QrCodeSource { get; set; }
        public List<int> AllowedEventTypeIds { get; set; } = new List<int>();
    }
}
