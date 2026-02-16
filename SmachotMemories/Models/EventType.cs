using SmachotMemories.DTOs;
namespace SmachotMemories.Models
{
    public class EventType
    {
        public int EventTypeId { get; set; }
        public string EventTypeNameKey { get; set; } = null!;
        public int DefaultAlbumSCount { get; set; }
        
        // ✅ קשר לאולם - כל EventType שייך לאולם אחד
        public int? HallId { get; set; }
        public Hall? Hall { get; set; }
        
        public ICollection<ReadyAlbum> ReadyAlbums { get; set; } = new List<ReadyAlbum>();
    }
}
