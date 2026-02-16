using SmachotMemories.Models.Enums;

namespace SmachotMemories.DTOs
{
    public class AddHallFeedbackDto
    {
        public int EventId { get; set; }
        public int HallId { get; set; }

        public FeedbackCategoryEnum Category { get; set; }
        public int? TableNumber { get; set; }

        public string Content { get; set; } = null!;
        public int? Rating { get; set; }
    }
}
