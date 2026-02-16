namespace SmachotMemories.DTOs
{
    public class UpdateEventDto
    {
        public string EventName { get; set; } = null!;
        public DateTime EventDate { get; set; }
        public string? BackgroundImageUrl { get; set; }
        public int HallId { get; set; }
    }
}
