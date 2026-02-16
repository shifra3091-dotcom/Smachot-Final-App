using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmachotMemories.Models;

namespace SmachotMemories.Data
{
    public class SmachotContext : IdentityDbContext<User, UserRole, int>
    {
        public SmachotContext(DbContextOptions<SmachotContext> options)
                     : base(options)
        { }

        public DbSet<Album> Albums { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<GoldenBookEntry> GoldenBookEntries { get; set; }
        public DbSet<GuestSubmission> GuestSubmissions { get; set; }
        public DbSet<Hall> Halls { get; set; }
        public DbSet<HallFeedback> HallFeedbacks { get; set; }
        public DbSet<Media> Medias { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UIText> UITexts { get; set; }
        public DbSet<EventType> EventTypes { get; set; }
        public DbSet<ReadyAlbum> ReadyAlbums { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<EventType>()
                .HasOne(et => et.Hall)
                .WithMany(h => h.AllowedEventTypes)
                .HasForeignKey(et => et.HallId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
