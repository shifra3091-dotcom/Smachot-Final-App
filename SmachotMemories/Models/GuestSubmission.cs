using System.ComponentModel.DataAnnotations.Schema;

namespace SmachotMemories.Models
{
    public class GuestSubmission
    {
        public int GuestSubmissionId { get; set; }

        public int EventId { get; set; }
        [ForeignKey(nameof(EventId))]
        public Event Event { get; set; } = null!;

        public string DeviceId { get; set; } = null!;
        public bool HasSubmitted { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
