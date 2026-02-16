namespace SmachotMemories.DTOs
{
    public class EventTypeDto
    {
        public int EventTypeId { get; set; }
        public string EventTypeNameKey { get; set; }
        public int DefaultAlbumSCount { get; set; }
        public List<ReadyAlbumDto> ReadyAlbums { get; set; }
    }
}
