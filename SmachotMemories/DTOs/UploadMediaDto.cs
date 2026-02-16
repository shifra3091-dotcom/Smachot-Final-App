using SmachotMemories.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SmachotMemories.DTOs
{
    public class UploadMediaDto
    {
        public int EventId { get; set; }

        public List<int>? AlbumIds { get; set; }

        public MediaTypeEnum MediaType { get; set; }

        public IFormFile File { get; set; } = null!;

        public bool IsPublic { get; set; }

        public string? GuestName { get; set; }

        public int? DurationSeconds { get; set; }
    }
}
