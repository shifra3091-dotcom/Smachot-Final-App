namespace SmachotMemories.DTOs
{
    public class MediaDto
    {
        public int MediaId { get; set; }
        public int EventId { get; set; }
        public string? MediaType { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public string? GuestName { get; set; }
        public int? DurationSeconds { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}
