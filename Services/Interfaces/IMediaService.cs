using SmachotMemories.DTOs;
using SmachotMemories.Models;

namespace SmachotMemories.Services.Interfaces
{
    public interface IMediaService
    {
        Task<Media> UploadMediaAsync(UploadMediaDto dto);
        Task<List<Media>> GetPublicMediaForEventAsync(int eventId);
        Task<List<Media>> GetAllMediaForEventAsync(int eventId);
        Task<bool> CanUploadAsync(int eventId);
        Task<bool> AddMediaToAlbumAsync(int mediaId, int albumId);
        Task<bool> RemoveMediaFromAlbumAsync(int mediaId, int albumId);
        Task<bool> SetMediaAlbumsAsync(int mediaId, List<int> albumIds);
        Task<(byte[] zipBytes, string fileName)?> CreateMediaZipAsync(int eventId, int? albumId = null, bool updateDownloadStatus = true);
        Task<bool> DeleteMediaAsync(int mediaId);

        Task<List<AlbumMediaGroupDto>> GetMediaGroupedByAlbumAsync(int eventId, bool onlyPublic = false, bool includeUnassigned = true);
    }
}
