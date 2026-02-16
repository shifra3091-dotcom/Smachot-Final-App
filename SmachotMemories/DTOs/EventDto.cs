using SmachotMemories.Models;
using SmachotMemories.Models.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmachotMemories.DTOs
{
    public class EventDto
    {
        public int EventId { get; set; }
        public string EventName { get; set; } = null!;
        public DateTime EventStartDate { get; set; }
        public DateTime EventEndDate { get; set; }
        public string? BackgroundImageUrl { get; set; }
        public int OwnerUserId { get; set; }
        public string OwnerUserName { get; set; }

        public int HallId { get; set; }
        public string HallName { get; set; }
        public DateTime CreatedAt { get; set; }

        public int? EventTypeId { get; set; }
        public string? EventTypeName { get; set; }

        // Download tracking
        public DownloadStatusEnum DownloadStatus { get; set; }
        public DateTime? LastDownloadedAt { get; set; }
        public decimal SumPayments { get; set; }
        public int GoldenBookEntriesCount { get; set; }
        public int ImagesCount { get; set; }
        public int VideoCount { get; set; }
    }
}
