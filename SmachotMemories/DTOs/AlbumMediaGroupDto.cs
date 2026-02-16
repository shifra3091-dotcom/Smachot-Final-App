using SmachotMemories.Models;

namespace SmachotMemories.DTOs
{
    public class AlbumMediaGroupDto
    {
        public int? AlbumId { get; set; }
        public string? AlbumName { get; set; }
        public List<MediaDto> MediaItems { get; set; }
    }
}
