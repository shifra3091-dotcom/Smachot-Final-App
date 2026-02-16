using Microsoft.Extensions.Logging;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmachotMemories.Models
{
    public class Album
    {
        public int AlbumId { get; set; }
        public int EventId { get; set; }
        [ForeignKey(nameof(EventId))]
        public Event Event { get; set; } = null!;

        public string Name { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public ICollection<Media> MediaItems { get; set; } = new List<Media>();
    }
}
