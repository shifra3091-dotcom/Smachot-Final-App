namespace SmachotMemories.DTOs
{
    public class AddGoldenBookEntryDto
    {
        public int EventId { get; set; }
        public string? SenderName { get; set; }
        public string Content { get; set; } = null!;
    }
}
