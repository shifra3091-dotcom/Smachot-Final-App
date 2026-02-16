using SmachotMemories.Models.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmachotMemories.Models
{
    public class HallFeedback
    {
        public int HallFeedbackId { get; set; }

        public int HallId { get; set; }
        [ForeignKey(nameof(HallId))]
        public Hall Hall { get; set; } = null!;

        public int EventId { get; set; }
        [ForeignKey(nameof(EventId))]
        public Event Event { get; set; } = null!;

        public FeedbackCategoryEnum Category { get; set; }
        public int? TableNumber { get; set; }
        public string Content { get; set; } = null!;
        public int? Rating { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
