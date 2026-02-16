using SmachotMemories.Models;

namespace SmachotMemories.Services.Interfaces
{
    public interface IAlbumService
    {
        Task<Album> CreateAlbumAsync(int eventId, string name);
        Task<List<Album>> GetAlbumsForEventAsync(int eventId);
        Task RenameAlbumAsync(int albumId, string newName);
        Task DeleteAlbumAsync(int albumId);
    }
}
