using System.ComponentModel.DataAnnotations.Schema;

namespace SmachotMemories.Models
{
    public class ReadyAlbum
    {
        public int ReadyAlbumId { get; set; }
        public string AlbumName { get; set; }
        public bool Family { get; set; }
        public bool Times { get; set; }
        public bool IsDefault { get; set; }
        public int EventTypeId { get; set; }
        [ForeignKey("EventTypeId")]
        public EventType EventType { get; set; }
    }
}
