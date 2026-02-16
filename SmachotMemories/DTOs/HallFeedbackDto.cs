using SmachotMemories.Models.Enums;

namespace SmachotMemories.DTOs
{
    public class HallFeedbackDto
    {
        public int HallFeedbackId { get; set; }
        public int HallId { get; set; }
        public int EventId { get; set; }
        public FeedbackCategoryEnum Category { get; set; }
        public string CategoryName => Category.ToString();
        public int? TableNumber { get; set; }
        public string Content { get; set; } = null!;
        public int? Rating { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
