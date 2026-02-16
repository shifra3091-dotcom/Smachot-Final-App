namespace SmachotMemories.DTOs
{
    public class CreateEventDto
    {
        public string EventName { get; set; } = null!;
        public DateTime EventDate { get; set; }
        public string? BackgroundImageUrl { get; set; }
        public int HallId { get; set; }
        public int? EventTypeId { get; set; }
    }
}
