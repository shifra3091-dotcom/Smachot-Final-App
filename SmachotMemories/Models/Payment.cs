using SmachotMemories.Models.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmachotMemories.Models
{
    public class Payment
    {
        public int PaymentId { get; set; }

        public int EventId { get; set; }
        [ForeignKey(nameof(EventId))]
        public Event Event { get; set; } = null!;

        public PaymentMethodEnum Method { get; set; }
        public decimal Sum { get; set; }
        public string GuestName { get; set; }
        public string GuestPhone { get; set; }
        public string? ScreenshotUrl { get; set; }
        public string? BlessingText { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
