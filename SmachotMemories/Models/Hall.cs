using System.ComponentModel.DataAnnotations.Schema;

namespace SmachotMemories.Models
{
    public class Hall
    {
        public int HallId { get; set; }
        public string Name { get; set; } = null!;
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? ImageUrl { get; set; }

        public int OwnerUserId { get; set; }
        [ForeignKey(nameof(OwnerUserId))]
        public User OwnerUser { get; set; } = null!;

        public DateTime CreatedAt { get; set; }
        public string QrCodeSource { get; set; } = null!;
        
        public ICollection<Event> Events { get; set; } = new List<Event>();
        public ICollection<HallFeedback> Feedbacks { get; set; } = new List<HallFeedback>();
        
        // ✅ שינוי: כל אולם יוצר EventTypes משלו
        public ICollection<EventType> AllowedEventTypes { get; set; } = new List<EventType>();
    }
}
