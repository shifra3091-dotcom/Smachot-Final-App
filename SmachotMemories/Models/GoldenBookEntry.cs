using System.ComponentModel.DataAnnotations.Schema;

namespace SmachotMemories.Models
{
    public class GoldenBookEntry
    {
        public int GoldenBookEntryId { get; set; }

        public int EventId { get; set; }
        [ForeignKey(nameof(EventId))]
        public Event Event { get; set; } = null!;
        public string SenderName { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}
