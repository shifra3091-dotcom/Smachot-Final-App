using System.ComponentModel.DataAnnotations.Schema;
using SmachotMemories.Models.Enums;

namespace SmachotMemories.Models
{
    public class Event
    {
        public int EventId { get; set; }
        public string EventName { get; set; } = null!;
        public DateTime EventStartDate { get; set; }
        public DateTime EventEndDate { get; set; }
        public string? BackgroundImageUrl { get; set; }
        //public bool IsActive { get; set; }
        public bool IsActive =>
            DateTime.Now >= EventStartDate && DateTime.Now <= EventEndDate;
        public int OwnerUserId { get; set; }
        [ForeignKey(nameof(OwnerUserId))]
        public User OwnerUser { get; set; } = null!;

        public int HallId { get; set; }
        [ForeignKey(nameof(HallId))]
        public Hall Hall { get; set; }
        public DateTime CreatedAt { get; set; }

        public int? EventTypeId { get; set; }
        [ForeignKey(nameof(EventTypeId))]
        public EventType EventType { get; set; }

        // Download tracking
        public DownloadStatusEnum DownloadStatus { get; set; } = DownloadStatusEnum.NotDownloaded;
        public DateTime? LastDownloadedAt { get; set; }

        public ICollection<Album> Albums { get; set; } = new List<Album>();
        public ICollection<Media> MediaItems { get; set; } = new List<Media>();
        public ICollection<GoldenBookEntry> GoldenBookEntries { get; set; } = new List<GoldenBookEntry>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
