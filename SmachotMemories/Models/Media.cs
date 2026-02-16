using SmachotMemories.Models.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmachotMemories.Models
{
    public class Media
    {
        public int MediaId { get; set; }

        public int EventId { get; set; }
        [ForeignKey(nameof(EventId))]
        public Event Event { get; set; } = null!;

        public ICollection<Album> Albums { get; set; } = new List<Album>();

        public MediaTypeEnum MediaType { get; set; }
        public string FileUrl { get; set; } = null!;
        public bool IsPublic { get; set; }

        public string? GuestName { get; set; }
        public int? DurationSeconds { get; set; }

        public DateTime UploadedAt { get; set; }
    }
}
